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

export class StaticRouteStore extends Base {
  get client() {
    return client.neutron.routers;
  }

  @action
  async fetchList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { id } = filters;
    const result = await this.client.show(id);
    const data = get(result, this.responseKey, {});
    const { routes = [] } = data;
    routes.forEach((it) => {
      it.router_id = id;
      it.id = `${it.destination} - ${it.nexthop}`;
    });
    this.list.update({
      data: routes,
      total: routes.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return routes;
  }

  async addStaticRoute({ id, routes }) {
    const body = {
      router: {
        routes,
      },
    };
    return this.submitting(this.client.addExtraRoutes(id, body));
  }

  async removeStaticRoute({ id, routes }) {
    const body = {
      router: {
        routes,
      },
    };
    return this.submitting(this.client.removeExtraRoutes(id, body));
  }
}

const globalStaticRouteStore = new StaticRouteStore();
export default globalStaticRouteStore;
