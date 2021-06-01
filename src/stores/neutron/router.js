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

import { action, observable } from 'mobx';
import { neutronBase } from 'utils/constants';
import { PortStore } from 'stores/neutron/port';
import Base from '../base';
import globalNetworkStore from './network';

export class RouterStore extends Base {
  get module() {
    return 'routers';
  }

  get apiVersion() {
    return neutronBase();
  }

  get responseKey() {
    return 'router';
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

  @observable
  snats = [];

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get mapper() {
    return (data) => {
      const { external_gateway_info: externalGateway = {} } = data || {};
      return {
        ...data,
        hasExternalGateway: !!externalGateway,
        externalNetworkId:
          (externalGateway && externalGateway.network_id) || '',
        externalNetworkName:
          (externalGateway && externalGateway.network_name) || '',
        externalFixedIps:
          (externalGateway && externalGateway.external_fixed_ips) || [],
      };
    };
  }

  get paramsFuncPage() {
    return (params, all_projects) => {
      const { current, ...rest } = params;
      if (!all_projects) {
        return {
          ...rest,
          project_id: this.currentProject,
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
    const subnetResult = await request.get(`${this.apiVersion}/subnets`);
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

  @action
  async fetchFirewallCreateList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const newParams = this.paramsFunc(params);
    const url = this.getListDetailUrl() || this.getListUrl();
    const newUrl = this.updateUrl(url, params);
    const allData = await this.requestList(newUrl, newParams);
    const allDataNew = allData.map(this.mapperBeforeFetchProject);
    const data = allDataNew.filter((item) => {
      if (!this.listFilterByProject) {
        return true;
      }
      return this.itemInCurrentProject(item, all_projects);
    });
    // const items = data.map(this.mapper);
    let newData = await this.listDidFetchProject(data, all_projects);
    newData = await this.listDidFetchFirewall(newData, all_projects, filters);
    newData = newData.map(this.mapper);
    this.list.update({
      data: newData,
      total: newData.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return newData;
  }

  async connectSubnet({ id, subnetId, networkId }) {
    const url = `${this.getListUrl()}/${id}/add_router_interface`;
    const body = {
      subnet_id: subnetId,
    };
    try {
      this.isSubmitting = true;
      await request.put(url, body);
      this.isSubmitting = false;
      return Promise.resolve();
    } catch (error) {
      const portUrl = `${this.apiVersion}/ports`;
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
      const port = await request.post(portUrl, portBody);
      const portId = port.port.id;
      const newBody = {
        port_id: portId,
      };
      return this.submitting(request.put(url, newBody));
    }
  }

  async disconnectSubnet({ id, subnetId }) {
    const url = `${this.getListUrl()}/${id}/remove_router_interface`;
    const body = {
      subnet_id: subnetId,
    };
    return this.submitting(request.put(url, body));
  }

  async associateFip({ id, fip, router }) {
    const networkId = fip.floating_network_id;
    const portUrl = `${this.apiVersion}/ports`;
    const portAddress = fip.floating_ip_address;
    const portParams = {
      network_id: networkId,
    };
    const result = await request.get(portUrl, portParams);
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
