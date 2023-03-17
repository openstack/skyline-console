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
import networkUtils from 'src/pages/network/containers/Network/actions/networkUtil';
import { get } from 'lodash';
import globalProjectStore from 'stores/keystone/project';
import client from 'client';
import { isExternalNetwork } from 'resources/neutron/network';
import Base from 'stores/base';

const { splitToArray } = networkUtils;

export class NetworkStore extends Base {
  @observable
  subnets = [];

  @observable
  topology = {};

  @observable
  securityGroups = [];

  // use this to check subnet quota when create network
  @observable
  createWithSubnet = false;

  get client() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get skylineExtensionClient() {
    return client.skyline.extension;
  }

  get extensionClient() {
    return client.neutron.extensions;
  }

  get routerClient() {
    return client.neutron.routers;
  }

  get ipClient() {
    return client.neutron.networkIpAvailabilities;
  }

  get portClient() {
    return client.neutron.ports;
  }

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (data) => {
      const { created_at } = data;
      return {
        ...data,
        standard_attr_id: created_at,
      };
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get paramsFuncPage() {
    return (params) => {
      const { project_id, current, ...rest } = params;
      return project_id === 'all' ? rest : { project_id, ...rest };
    };
  }

  listExtensions = async () => {
    const extensions = await this.extensionClient.list();
    return extensions;
  };

  fetchDHCPAgents = async (id) => {
    const data = await this.client.dhcpAgents.list(id);
    return data;
  };

  async listDidFetch(items, allProjects, filters) {
    const { isFirewall } = filters;
    if (!isFirewall) {
      return items;
    }
    const data = await this.listDidFetchFirewall(items);
    return data;
  }

  async listDidFetchFirewall(items) {
    const ret = await Promise.all(
      items.map(async (networkItem) => {
        const promises = networkItem.subnets.map((subnetItem) =>
          this.fetchSubnetDetail({ id: subnetItem })
        );
        try {
          const results = await Promise.all(promises);
          networkItem.subnetDetails = results || [];
        } catch (e) {
          networkItem.subnetDetails = [];
        }
        return networkItem;
      })
    );
    return ret;
  }

  @action
  async fetchDetailWithAvailabilityAndUsage({
    id,
    isAdminPage,
    canAddNetworkIPUsageInfo,
  }) {
    this.isLoading = true;
    const result = await this.client.show(id);
    const originData = get(result, this.responseKey) || result;
    const promises = [
      Promise.resolve({ agents: [] }),
      Promise.resolve({ name: '' }),
    ];
    if (isAdminPage) {
      // fix for dhcp agents number column
      const { extensions } = await this.listExtensions();
      const isExtensionSupported = extensions.some(
        (item) => item.alias === 'dhcp_agent_scheduler'
      );
      if (isExtensionSupported && this.hasAdminRole) {
        promises.splice(0, 1, this.fetchDHCPAgents(id));
      }
      const { tenant_id } = originData;
      if (tenant_id) {
        promises.splice(
          1,
          1,
          globalProjectStore.fetchDetail({ id: tenant_id })
        );
      }
    }
    const [dhcp, projectDetail] = await Promise.all(promises);
    this.detail = {
      ...originData,
      dhcp_agents: dhcp.agents.length,
      projectName: projectDetail.name,
    };

    // Only the administrator can view the number of IP addresses used
    if (canAddNetworkIPUsageInfo) {
      const used = await this.ipClient.show(id);
      this.detail = {
        ...this.detail,
        ...used.network_ip_availability,
        total_ips: used.network_ip_availability.subnet_ip_availability.reduce(
          (pre, cur) => sumBigNumber(pre, cur.total_ips),
          0
        ),
      };
    }
    this.isLoading = false;
    return this.detail;

    function sumBigNumber(a, b) {
      let res = '';
      let temp = 0;
      a = `${a}`.split('');
      b = `${b}`.split('');
      while (a.length || b.length || temp) {
        // eslint-disable-next-line no-bitwise
        temp += ~~a.pop() + ~~b.pop();
        res = (temp % 10) + res;
        temp = temp > 9;
      }
      return res.replace(/^0+/, '');
    }
  }

  @action
  async fetchSubnetDetail({ id }) {
    try {
      const resData = await this.subnetClient.show(id);
      return resData.subnet;
    } catch (e) {
      return {};
    }
  }

  @action
  async fetchTopoNetwork() {
    await Promise.all([this.client.list(), this.subnetClient.list()]).then(
      ([resData, subnetRes]) => {
        resData.subnets = subnetRes.subnets;
        resData.networks = resData.networks.filter(
          (network) =>
            isExternalNetwork(network) ||
            network.shared ||
            network.project_id === this.currentProjectId
        );
        this.topology = resData;
      }
    );
  }

  @action
  async fetchTopo() {
    const params = {
      project_id: this.currentProjectId,
    };
    await Promise.all([
      this.routerClient.list(params),
      this.skylineExtensionClient.servers(),
      this.portClient.list(params),
    ]).then(([routersRes, serversRes, portRes]) => {
      const resData = this.topology;
      routersRes.routers.map((it) => {
        const routerSubnets = [];
        const portForwardings = portRes.ports.filter(
          (port) => port.device_id === it.id
        );
        portForwardings.forEach((portForwarding) => {
          const { fixed_ips } = portForwarding;
          if (
            fixed_ips[0] &&
            routerSubnets.indexOf(fixed_ips[0].subnet_id) === -1
          ) {
            routerSubnets.push(fixed_ips[0].subnet_id);
          }
        });
        it.subnets = routerSubnets;
        return it;
      });
      // const showNetworkId = resData.networks.map(it => it.id);
      resData.routers = routersRes.routers;
      resData.servers = serversRes.servers;
      resData.servers.map((it) => {
        const serverPorts = portRes.ports.filter(
          (port) => port.device_id === it.id && port.fixed_ips[0]
        );
        it.fixed_networks = serverPorts.map((port) => port.network_id);
        it.fixed_ip_address = serverPorts.map((port) =>
          port.fixed_ips.map((fixed_ip) => fixed_ip.ip_address)
        );
        return it;
      });
      resData.extNetwork = resData.networks.filter((it) =>
        isExternalNetwork(it)
      );
      this.topology = resData;
    });
  }

  @action
  async createAndMore(data, rest) {
    const body = {};
    body[this.responseKey] = data;
    const res = await this.create(data).catch((e) => {
      return Promise.reject(
        JSON.stringify({ type: 'create_network', error: e.response.data })
      );
    });
    const { network } = res;
    const { create_subnet } = rest;
    if (create_subnet) {
      const { project_id, id } = network;
      const subnet = await this.createSubnet({
        ...rest,
        project_id,
        network_id: id,
      }).catch((e) => {
        return Promise.reject(
          JSON.stringify({ type: 'create_subnet', error: e.response.data })
        );
      });
      return subnet;
    }
    // return this.submitting(Promise.resolve(res));
    return Promise.resolve(res);
  }

  @action
  async createSubnet(values) {
    const {
      dns,
      host_routes,
      allocation_pools,
      project_id,
      network_id,
      subnet_name,
      enable_dhcp,
      ip_version,
      ipv6_address_mode,
      ipv6_ra_mode,
      gateway_ip,
      cidr,
      disable_gateway,
    } = values;
    const dns_nameservers = splitToArray(dns);
    const data = {
      project_id,
      name: subnet_name,
      enable_dhcp,
      network_id,
      dns_nameservers,
      allocation_pools,
      host_routes,
      ip_version: ip_version === 'ipv4' ? 4 : 6,
      gateway_ip: disable_gateway || gateway_ip === '' ? null : gateway_ip,
      cidr,
    };
    if (data.ip_version === 6) {
      data.ipv6_address_mode = ipv6_address_mode;
      data.ipv6_ra_mode = ipv6_ra_mode;
    }
    return this.subnetClient.create({ subnet: data });
  }

  @action
  updateCreateWithSubnet(value) {
    this.createWithSubnet = value;
  }
}
const globalNetworkStore = new NetworkStore();

export default globalNetworkStore;
