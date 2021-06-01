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
import { neutronBase, skylineBase } from 'utils/constants';
import networkUtils from 'src/pages/network/containers/Network/actions/networkUtil';
import { get } from 'lodash';
import globalProjectStore from 'stores/keystone/project';
import Base from '../base';

const { splitToArray } = networkUtils;

export class NetworkStore extends Base {
  @observable
  subnets = [];

  @observable
  topology = {};

  @observable
  securityGroups = [];

  get module() {
    return 'networks';
  }

  get apiVersion() {
    return neutronBase();
  }

  get responseKey() {
    return 'network';
  }

  get listFilterByProject() {
    return true;
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
    const extensions = await request.get(`${this.apiVersion}/extensions`);
    return extensions;
  };

  fetchDHCPAgents = async (id) => {
    const data = await request.get(
      `${this.apiVersion}/networks/${id}/dhcp-agents`
    );
    return data;
  };

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

  // async listDidFetch(items) {
  //   // fix for dhcp agents number column
  //   const { extensions } = await this.listExtensions();
  //   const isExtensionSupported = extensions.some(item => item.alias === 'dhcp_agent_scheduler');
  //
  //   if (isExtensionSupported && globals.user.hasAdminRole) {
  //     const dhcpPromises = items.map(networkItem => this.fetchDHCPAgents(networkItem.id));
  //     const dhcpAgents = await Promise.all(dhcpPromises);
  //     items.forEach((i, index) => {
  //       i.agents_num = dhcpAgents[index].agents.length;
  //     });
  //   }
  //
  //   const ret = await Promise.all(items.map(async (networkItem) => {
  //     const promises = networkItem.subnets.map(subnetItem => this.fetchSubnetDetail({ id: subnetItem }));
  //     try {
  //       const results = await Promise.all(promises);
  //       networkItem.subnetDetails = results || [];
  //     } catch (e) {
  //       networkItem.subnetDetails = [];
  //     }
  //     return networkItem;
  //   }));
  //   return ret;
  // }

  @action
  async fetchDetailWithAvailabilityAndUsage({
    id,
    isAdminPage,
    currentProjectId,
  }) {
    this.isLoading = true;
    const result = await request.get(this.getDetailUrl({ id }));
    const originData = get(result, this.responseKey) || result;
    const promises = [
      // request.get(`${this.apiVersion}/network-ip-availabilities/${id}`),
      Promise.resolve({ agents: [] }),
      Promise.resolve({ name: '' }),
    ];
    if (isAdminPage) {
      // fix for dhcp agents number column
      const { extensions } = await this.listExtensions();
      const isExtensionSupported = extensions.some(
        (item) => item.alias === 'dhcp_agent_scheduler'
      );
      if (isExtensionSupported && globals.user.hasAdminRole) {
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

    // 处理使用IP数量，只有管理员或者当前网络所有者才能查看
    if (isAdminPage || currentProjectId === originData.project_id) {
      const used = await request.get(
        `${this.apiVersion}/network-ip-availabilities/${id}`
      );
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
    const resData = await request.get(
      `${this.apiVersion}/subnets/${id}`,
      null,
      null,
      (res) => {
        if (res.reason === 'NotFound' || res.reason === 'Forbidden') {
          // global.navigateTo('/404')
        }
        return res.subnet;
      }
    );
    return resData.subnet;
  }

  @action
  async fetchTopoNetwork() {
    await Promise.all([
      request.get(`${this.apiVersion}/networks`),
      request.get(`${this.apiVersion}/subnets`),
    ]).then(([resData, subnetRes]) => {
      resData.subnets = subnetRes.subnets;
      resData.networks = resData.networks.filter(
        (network) =>
          network['router:external'] ||
          network.shared ||
          network.project_id === globals.user.project.id
      );
      this.topology = resData;
    });
  }

  @action
  async fetchTopo() {
    await Promise.all([
      // request.get(`${this.apiVersion}/networks`),
      // request.get(`${this.apiVersion}/subnets`),
      request.get(`${this.apiVersion}/routers`, {
        project_id: globals.user.project.id,
      }),
      request.get(`${skylineBase()}/extension/servers`),
      request.get(`${this.apiVersion}/ports`, {
        project_id: globals.user.project.id,
      }),
    ]).then(([routersRes, serversRes, portRes]) => {
      const resData = this.topology;
      routersRes.routers.map((it) => {
        const routerSubnets = [];
        const portforwardings = portRes.ports.filter(
          (port) => port.device_id === it.id
        );
        portforwardings.forEach((portforwarding) => {
          const { fixed_ips } = portforwarding;
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
      resData.extNetwork = resData.networks.filter(
        (it) => it['router:external']
      );
      this.topology = resData;
    });
  }

  @action
  async createAndMore(data, rest) {
    const body = {};
    body[this.responseKey] = data;
    let res = null;
    try {
      res = await this.create(data);
    } catch (e) {
      return Promise.reject(
        JSON.stringify({ type: 'create_network', error: e })
      );
    }
    const { network } = res;
    const { create_subnet } = rest;
    try {
      if (create_subnet) {
        const { project_id, id } = network;
        const subnet = await this.createSubnet({
          ...rest,
          project_id,
          network_id: id,
        });
        return subnet;
      }
    } catch (e) {
      return Promise.reject(
        JSON.stringify({ type: 'create_subnet', error: e })
      );
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
      gateway_ip: disable_gateway ? null : gateway_ip,
      cidr,
    };
    return this.submitting(
      request.post(`${this.apiVersion}/subnets`, { subnet: data })
    );
  }
}
const globalNetworkStore = new NetworkStore();

export default globalNetworkStore;
