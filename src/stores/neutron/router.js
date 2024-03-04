// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { observable } from 'mobx';
import { PortStore } from 'stores/neutron/port';
import client from 'client';
import Base from 'stores/base';
import globalNetworkStore from 'stores/neutron/network';

export class RouterStore extends Base {
  get client() {
    return client.neutron.routers;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get portClient() {
    return client.neutron.ports;
  }

  get listFilterByProject() {
    return true;
  }

  @observable
  unassociatedRouters = {
    data: [],
    isLoading: false,
  };

  @observable
  staticRoutes = [];

  @observable
  portForwardings = [];

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get mapper() {
    return (data) => {
      const { external_gateway_info: externalGateway = {}, created_at } =
        data || {};
      return {
        ...data,
        hasExternalGateway: !!externalGateway,
        externalNetworkId:
          (externalGateway && externalGateway.network_id) || '',
        externalNetworkName:
          (externalGateway && externalGateway.network_name) || '',
        externalFixedIps:
          (externalGateway && externalGateway.external_fixed_ips) || [],
        standard_attr_id: created_at,
      };
    };
  }

  get paramsFuncPage() {
    return (params, all_projects) => {
      const { current, ...rest } = params;
      if (!all_projects) {
        return {
          ...rest,
          project_id: this.currentProjectId,
        };
      }
      return rest;
    };
  }

  async detailDidFetch(item) {
    const { network_id, network_name } =
      (item || {}).external_gateway_info || {};
    if (network_id && !network_name) {
      try {
        const network = await globalNetworkStore.fetchDetail({
          id: network_id,
        });
        item.external_gateway_info.network_name = network.name;
      } catch (e) {}
    }
    return item;
  }

  async fetchConnectedSubnets(routerItem) {
    const subnetResult = await this.subnetClient.list();
    const { subnets } = subnetResult;
    const routerInterfaceList = [
      'network:router_interface_distributed',
      'network:router_interface',
      'network:ha_router_replicated_interface',
    ];
    const portStore = new PortStore();
    const ports = await portStore.fetchList({ device_id: routerItem.id });
    const connectSubnets = [];
    routerItem.ports = ports;
    ports.forEach((port) => {
      if (routerInterfaceList.indexOf(port.device_owner) > -1) {
        port.fixed_ips.forEach((ip) => {
          const subnet = subnets.find((it) => it.id === ip.subnet_id);
          if (subnet) {
            connectSubnets.push(subnet);
          }
        });
      }
    });
    routerItem.connectSubnets = connectSubnets;
    return routerItem;
  }

  async updateExternalNetworkForItems(items) {
    const externalNetworkIds = [];
    items.forEach((it) => {
      if (it.external_gateway_info?.network_id) {
        externalNetworkIds.push(it.external_gateway_info?.network_id);
      }
    });
    if (externalNetworkIds.length) {
      const { networks = [] } = await this.networkClient.list({
        'router:external': 'true',
      });
      items.forEach((it) => {
        if (it.external_gateway_info?.network_id) {
          const network = networks.find(
            (n) => n.id === it.external_gateway_info?.network_id
          );
          it.external_gateway_info.network_name = network.name;
        }
      });
    }
  }

  async listDidFetch(items, allProjects, filters) {
    const { isFirewall } = filters;
    await this.updateExternalNetworkForItems(items);
    if (!isFirewall) {
      return items;
    }
    const data = await this.listDidFetchFirewall(items);
    return data;
  }

  async listDidFetchFirewall(items) {
    // eslint-disable-next-line no-return-await
    return Promise.all(
      items.map(async (routerItem) => {
        const portStore = new PortStore();
        const ports = await portStore.fetchList({ device_id: routerItem.id });
        routerItem.ports = ports;
        return routerItem;
      })
    );
  }

  async connectSubnet({ id, subnetId, networkId }) {
    const body = {
      subnet_id: subnetId,
    };
    try {
      this.isSubmitting = true;
      await this.client.addRouterInterface(id, body);
      this.isSubmitting = false;
      return Promise.resolve();
    } catch (error) {
      const portBody = {
        port: {
          network_id: networkId,
          fixed_ips: [
            {
              subnet_id: subnetId,
            },
          ],
        },
      };
      const port = await this.portClient.create(portBody);
      const portId = port.port.id;
      const newBody = {
        port_id: portId,
      };
      return this.submitting(this.client.addRouterInterface(id, newBody));
    }
  }

  async disconnectSubnet({ id, subnetId }) {
    const body = {
      subnet_id: subnetId,
    };
    return this.submitting(this.client.removeRouterInterface(id, body));
  }

  async associateFip({ id, fip, router }) {
    const networkId = fip.floating_network_id;
    const portAddress = fip.floating_ip_address;
    const portParams = {
      network_id: networkId,
    };
    const result = await this.portClient.list(portParams);
    const port = result.ports.find((it) => {
      const { fixed_ips: fixedIps } = it;
      return (
        fixedIps &&
        fixedIps.length > 0 &&
        fixedIps[0].ip_address === portAddress
      );
    });
    const fixedIp = (port && port.fixed_ips[0]) || null;
    if (!fixedIp) {
      return Promise.reject();
    }
    const {
      external_gateway_info: { external_fixed_ips: oldFixedIps = [] },
    } = router;
    const newFixedIps = [...oldFixedIps, fixedIp];
    const body = {
      external_gateway_info: {
        network_id: networkId,
        external_fixed_ips: newFixedIps,
      },
    };
    return this.edit({ id }, body);
  }

  async disassociateFip({ id, router }) {
    const {
      external_gateway_info: { network_id },
    } = router;
    const body = {
      external_gateway_info: {
        network_id,
        external_fixed_ips: [],
      },
    };
    return this.edit({ id }, body);
  }
}

const globalRouterStore = new RouterStore();
export default globalRouterStore;
