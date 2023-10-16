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

import { action } from 'mobx';
import { get } from 'lodash';
import client from 'client';
import Base from 'stores/base';

export class PortStore extends Base {
  get client() {
    return client.neutron.ports;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get routerClient() {
    return client.neutron.routers;
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, fixedIP, ...rest } = params;
      const newParams = { ...rest };
      if (fixedIP) {
        newParams.fixed_ips = `ip_address=${fixedIP}`;
      }
      return newParams;
    };
  }

  get paramsFunc() {
    return (params) => {
      const { all_projects, ...rest } = params;
      return rest;
    };
  }

  async detailDidFetch(item) {
    const { network_id } = item;
    try {
      const res = await this.networkClient.show(network_id);
      item.network = res.network;
      item.network_name = item.network.name;
      return item;
    } catch (err) {
      return item;
    }
  }

  async listDidFetchByFirewall(items) {
    const [networkResult, routerResult] = await Promise.all([
      this.networkClient.list(),
      this.routerClient.list(),
    ]);
    const { routers = [] } = routerResult;
    const { networks = [] } = networkResult;
    items.forEach((item) => {
      item.router = routers.find((it) => it.id === item.device_id);
      item.network = networks.find((it) => it.id === item.network_id);
    });
    return items;
  }

  @action
  async fetchListByFirewall({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // eslint-disable-next-line no-unused-vars
    const { ports, all_projects, ...rest } = filters;
    if (ports.length === 0) {
      this.list.update({
        data: [],
        total: 0,
        limit: Number(limit) || 10,
        page: Number(page) || 1,
        sortKey,
        sortOrder,
        filters,
        isLoading: false,
        ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      });
    }
    const routerInterfaceOwners = [
      'network:router_interface',
      'network:ha_router_replicated_interface',
      'network:router_interface_distributed',
    ];
    const result = await client.skyline.extension.ports({
      device_owner: routerInterfaceOwners,
    });
    let data = get(result, this.listResponseKey, []);
    data = data.filter((it) => ports.indexOf(it.id) >= 0);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetchByFirewall(items, all_projects);
    this.list.update({
      data: newData,
      total: items.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return items;
  }
}

const globalPortStore = new PortStore();
export default globalPortStore;
