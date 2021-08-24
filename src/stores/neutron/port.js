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
import { get, uniq } from 'lodash';
import client from 'client';
import { isExternalNetwork } from 'resources/network';
import Base from '../base';

export class PortStore extends Base {
  get client() {
    return client.neutron.ports;
  }

  async detailDidFetch(item) {
    const { network_id } = item;
    try {
      const res = await client.neutron.networks.show(network_id);
      item.network = res.network;
      item.network_name = item.network.name;
      return item;
    } catch (err) {
      return item;
    }
  }

  async listDidFetch(items, allProjects, filters) {
    const { withPrice } = filters;
    if (!withPrice) {
      return items;
    }
    const networkIds = uniq(items.map((it) => it.network_id));
    const networkResults = await Promise.all(
      networkIds.map((it) => {
        return client.neutron.networks.show(it);
      })
    );
    const networks = networkResults.map((it) => it.network);
    return items.map((it) => {
      const network = networks.find((net) => net.id === it.network_id);
      return {
        ...it,
        network,
        isExternalNetwork: isExternalNetwork(network),
      };
    });
  }

  async listDidFetchByFirewall(items) {
    const [networkResult, routerResult] = await Promise.all([
      client.neutron.networks.list(),
      client.neutron.routers.list(),
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
    const params = {
      device_owner: 'network:ha_router_replicated_interface',
    };
    const result = await this.client.list(params);
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
