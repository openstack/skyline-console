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

import { neutronBase, skylineBase } from 'utils/constants';
import globalNetworkStore from 'stores/neutron/network';
import { action, observable, toJS } from 'mobx';
import globalSecurityGroupStore from 'stores/neutron/security-group';
import { get } from 'lodash';
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import List from '../base-list';
import Base from '../base';

export class VirtualAdapterStore extends Base {
  get module() {
    return 'ports';
  }

  get apiVersion() {
    return neutronBase();
  }

  get responseKey() {
    return 'port';
  }

  getListDetailUrl = () => `${skylineBase()}/extension/${this.module}`;

  get listFilterByProject() {
    return false;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  @observable
  fixed_ips = new List();

  @observable
  security_groups = new List();

  @action
  update({ id }, newObject) {
    return this.submitting(
      request.put(`${this.getDetailUrl({ id })}`, { port: newObject })
    );
  }

  @action
  setDetail(detail) {
    this.detail = detail;
  }

  @action
  async fetchFixedIPsDetail(fixedIPs) {
    this.fixed_ips.isLoading = true;
    const promises = fixedIPs.map((item) =>
      globalNetworkStore.fetchSubnetDetail({ id: item.subnet_id })
    );
    const ret = await Promise.all(promises);
    const newData = fixedIPs.map((item, index) => {
      item.subnetName = ret[index].name;
      return item;
    });
    const fipDetails = await Promise.all(
      fixedIPs.map((item) => this.getItemFloatingIPs(item.ip_address))
    );
    fipDetails.forEach((fips, index) => {
      fips.forEach((fip) => {
        newData[index].fip = fip.floating_ip_address;
      });
    });
    this.fixed_ips.update({
      data: newData,
      total: newData.length || 0,
      isLoading: false,
      ...(this.fixed_ips.silent ? {} : { selectedRowKeys: [] }),
    });
  }

  @action
  async fetchSecurityGroupsDetail(id) {
    const detail = await this.fetchDetail({ id });
    const { security_groups } = detail;
    this.security_groups.isLoading = true;
    const promises = security_groups.map((item) =>
      globalSecurityGroupStore.fetchDetail({ id: item })
    );
    const data = await Promise.all(promises);
    data.forEach((item) => {
      item.port = detail;
    });
    this.security_groups.update({
      data,
      total: data.length || 0,
      isLoading: false,
      ...(this.security_groups.silent ? {} : { selectedRowKeys: [] }),
    });
  }

  @action
  async fetchListByPage({
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
    const { tab, all_projects, addressAsIdKey, ...rest } = filters;
    const params = { limit, ...rest };
    this.updateParamsSortPage(params, sortKey, sortOrder);
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    const marker = this.getMarker(page);
    if (marker) {
      params.marker = marker;
    }
    let url =
      this.getListPageUrl() || this.getListDetailUrl() || this.getListUrl();
    let result = null;
    if (filters.device_owner) {
      const { device_owner } = filters;
      url += '?';
      device_owner.forEach((item) => {
        url += `device_owner=${item}&`;
      });
      const { device_owner: d, ...restParams } = params;
      Object.keys(restParams).forEach((key) => {
        url += `${key}=${restParams[key]}&`;
      });
      result = await request.get(url);
    } else {
      result = await request.get(url, params);
    }
    let allData = this.listResponseKey
      ? get(result, this.listResponseKey, [])
      : result;
    const { count } = result;
    allData = await this.listDidFetchProject(allData, all_projects);
    this.updateMarker(allData, page);

    // if has 'device_owner' means not in detail page, need fip information to control action button show
    if (filters.device_owner) {
      // fetch fixed_ips details
      const details = await Promise.all(
        allData.map((item) => {
          if (addressAsIdKey) {
            const { id, ipv4, ipv6 } = item;
            item.address_id = id;
            item.member_ip = ipv6.concat(ipv4);
            item.member_show = item.member_ip.join('、');
            // item.id = item.member_ip[0];
          }
          return Promise.all(
            item.fixed_ips.map((fixed_ip) =>
              this.getItemFloatingIPs(fixed_ip.ip_address)
            )
          );
        })
      );
      details.forEach((detail, index) => {
        allData[index].associatedDetail = [];
        detail.forEach((ip) => {
          allData[index].associatedDetail.push(...toJS(ip));
        });
      });
    }

    this.list.update({
      data: allData,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      total: count,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return allData;
  }

  async getItemFloatingIPs(fixed_ip) {
    return globalFloatingIpsStore.pureFetchList({ fixed_ip_address: fixed_ip });
  }

  async detailDidFetch(item, all_projects) {
    const { id } = item;
    let itemContrib = {};
    try {
      const result = await this.fetchList({ uuid: id, all_projects });
      itemContrib = result[0];
    } catch (e) {}
    itemContrib.associatedDetail = [];
    if (item.fixed_ips.length !== 0) {
      const details = await Promise.all(
        itemContrib.fixed_ips.map((fixed_ip) =>
          this.getItemFloatingIPs(fixed_ip.ip_address)
        )
      );
      details.forEach((detail) => {
        itemContrib.associatedDetail.push(...detail);
      });
    }
    item.itemInList = itemContrib;
    return item;
  }
}

const globalVirtualAdapterStore = new VirtualAdapterStore();

export default globalVirtualAdapterStore;
