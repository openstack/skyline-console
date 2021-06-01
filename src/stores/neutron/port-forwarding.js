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
import { neutronBase } from 'utils/constants';
import { get } from 'lodash';
import Base from '../base';

export class PortForwardingStore extends Base {
  get module() {
    return 'port_forwardings';
  }

  get apiVersion() {
    return neutronBase();
  }

  get responseKey() {
    return 'port_forwarding';
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
    const fipUrl = `${this.apiVersion}/floatingips`;
    const fips =
      (await request.get(fipUrl, { router_id: id })).floatingips || [];
    const results = await Promise.all(
      fips.map((fip) => {
        const { id: fipId } = fip;
        const portForwardingUrl = `${fipUrl}/${fipId}/${this.module}`;
        return request.get(portForwardingUrl);
      })
    );
    let items = [];
    results.forEach((result, index) => {
      const data = get(result, this.listResponseKey, []).map((it) => {
        const fip = fips[index];
        return {
          ...it,
          fip,
          floating_ip_address: fip.floating_ip_address,
        };
      });
      items = [...items, ...data];
    });
    this.list.update({
      data: items,
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

  getPortForwardingDetailUrl({ fipID }) {
    return `${this.apiVersion}/floatingips/${fipID}/port_forwardings`;
  }

  @action
  async getFipAlreadyUsedPorts({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const newParams = this.paramsFunc(params);
    const url = this.getPortForwardingDetailUrl(filters);
    const newUrl = this.updateUrl(url, params);
    const allData = await this.requestList(newUrl, newParams, filters);
    const allDataNew = allData.map((it) =>
      this.mapperBeforeFetchProject(it, filters)
    );
    const data = allDataNew.filter((item) => {
      if (!this.listFilterByProject) {
        return true;
      }
      return this.itemInCurrentProject(item, all_projects);
    });
    // const items = data.map(this.mapper);
    let newData = await this.listDidFetchProject(data, all_projects);
    try {
      newData = await this.listDidFetch(newData, all_projects, filters);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
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

  @action
  create({ id, data }) {
    const body = {};
    body[this.responseKey] = data;
    const url = `${this.apiVersion}/floatingips/${id}/${this.listResponseKey}`;
    return this.submitting(request.post(url, body));
  }

  @action
  edit({ fipID, id }, newObject) {
    const body = {};
    body[this.responseKey] = newObject;
    return this.submitting(
      request.put(
        `${this.apiVersion}/floatingips/${fipID}/${this.listResponseKey}/${id}`,
        body
      )
    );
  }

  @action
  delete = ({ floatingipId, id }) => {
    const url = `${this.apiVersion}/floatingips/${floatingipId}/${this.listResponseKey}/${id}`;
    return this.submitting(request.delete(url));
  };
}

const globalPortForwardingStore = new PortForwardingStore();
export default globalPortForwardingStore;
