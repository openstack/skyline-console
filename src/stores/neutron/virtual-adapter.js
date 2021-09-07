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

import globalNetworkStore from 'stores/neutron/network';
import { action, observable, toJS } from 'mobx';
import globalSecurityGroupStore from 'stores/neutron/security-group';
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import client from 'client';
import List from 'stores/base-list';
import Base from 'stores/base';

export class VirtualAdapterStore extends Base {
  get client() {
    return client.neutron.ports;
  }

  listFetchByClient(params) {
    return this.skylineClient.extension.ports(params);
  }

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
    return this.submitting(this.client.update(id, { port: newObject }));
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
      fixedIPs.map((item) => this.getItemFloatingIPs(item.ip_address, item.id))
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

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { device_id, device_owner, addressAsIdKey, network_id } = filters;
    if (device_owner || device_id || network_id) {
      // fetch fixed_ips details
      const details = await Promise.all(
        items.map((item) => {
          if (addressAsIdKey) {
            const { id, ipv4, ipv6 } = item;
            item.address_id = id;
            item.member_ip = ipv6.concat(ipv4);
            item.member_show = item.member_ip.join('、');
            // item.id = item.member_ip[0];
          }
          return Promise.all(
            item.fixed_ips.map((fixed_ip) =>
              this.getItemFloatingIPs(fixed_ip.ip_address, item.id)
            )
          );
        })
      );
      details.forEach((detail, index) => {
        items[index].associatedDetail = [];
        detail.forEach((ip) => {
          items[index].associatedDetail.push(...toJS(ip));
        });
      });
    }
    return items;
  }

  async getItemFloatingIPs(fixed_ip, portId) {
    return globalFloatingIpsStore.pureFetchList({
      fixed_ip_address: fixed_ip,
      port_id: portId,
    });
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
          this.getItemFloatingIPs(fixed_ip.ip_address, id)
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
