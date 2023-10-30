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

export class LbaasStore extends Base {
  get client() {
    return client.octavia.loadbalancers;
  }

  get fipStore() {
    const globalFloatingIpsStore = require('stores/neutron/floatingIp').default;
    return globalFloatingIpsStore;
  }

  get listFilterByProject() {
    return true;
  }

  @action
  async fetchListByPageWithFip({
    limit = 10,
    page = 1,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    const { tab, all_projects, ...rest } = filters;
    const params = { limit, ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    const marker = this.getMarker(page);
    if (marker) {
      params.marker = marker;
    }
    const newParams = this.paramsFuncPage(params, all_projects);
    const result = await this.client.list(newParams);
    const allData = this.listResponseKey
      ? get(result, this.listResponseKey, [])
      : result;
    this.updateMarker(allData, page, result);
    const allDataNew = allData.map(this.mapperBeforeFetchProject);
    let newData = await this.listDidFetchProject(allDataNew, all_projects);
    const fipDetails = await Promise.all(
      newData.map((item) =>
        this.fipStore.pureFetchList({
          port_id: item.vip_port_id,
          fixed_ip_address: item.vip_address,
          all_projects,
        })
      )
    );
    newData.forEach((item, index) => {
      item.fip =
        fipDetails[index].length > 0
          ? fipDetails[index][0].floating_ip_address
          : null;
      item.fip_id =
        fipDetails[index].length > 0 ? fipDetails[index][0].id : null;
    });
    newData = newData.map(this.mapper);
    let count;
    let total;
    if (result.count || result.total) {
      count = result.count || result.total;
    } else {
      const totalResult = await this.getCountForPage(
        newParams,
        newData,
        all_projects,
        result,
        params
      );
      const { count: retCount, total: retTotal } = totalResult;
      count = retCount;
      total = retTotal;
    }
    this.list.update({
      data: newData,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      total: count || total,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return newData;
  }

  @action
  async fetchDetailWithFip({ id, all_projects, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const result = await this.client.show(
      id,
      this.getDetailParams({ all_projects })
    );
    const originData = get(result, this.responseKey) || result;
    const item = this.mapperBeforeFetchProject(originData);
    try {
      const newItem = await this.detailDidFetch(item, all_projects);
      const detail = this.mapper(newItem);
      const fipInfo = await this.fipStore.fetchList({
        fixed_ip_address: item.vip_address,
      });
      fipInfo.length > 0 && (detail.fip = fipInfo[0].floating_ip_address);
      this.detail = detail;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      this.detail = item;
    }
    this.isLoading = false;
    return this.detail;
  }

  @action
  delete = ({ id }) =>
    // TODO: check params;
    this.submitting(this.client.delete(id, { cascade: true }));
}

const globalLbaasStore = new LbaasStore();

export default globalLbaasStore;
