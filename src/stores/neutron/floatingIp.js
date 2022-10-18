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

import client from 'client';
import Base from 'stores/base';
import { action, observable } from 'mobx';
import globalRouterStore from 'stores/neutron/router';
import globalServerStore from 'stores/nova/instance';
import globalLbaasStore from 'stores/octavia/loadbalancer';
import { qosEndpoint } from 'client/client/constants';

export class FloatingIpStore extends Base {
  get client() {
    return client.neutron.floatingips;
  }

  get qosClient() {
    return client.neutron.qosPolicies;
  }

  get listFilterByProject() {
    return true;
  }

  get enableQos() {
    return !!qosEndpoint();
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

  @observable
  addInfo = {
    name: '-',
    externalNetworkName: '-',
  };

  async listDidFetch(items, allProjects, filters) {
    const { qos_policy_id } = filters;
    const hasQos = items.find((it) => !!it.qos_policy_id);
    if (hasQos && this.enableQos) {
      const qosResult = await this.qosClient.list();
      const { policies = [] } = qosResult || {};
      items.forEach((it) => {
        if (it.qos_policy_id) {
          const qosItem = policies.find((p) => p.id === it.qos_policy_id);
          if (qosItem) {
            it.qos_policy_name = qosItem.name;
          }
        }
      });
    }
    if (!qos_policy_id) {
      return items;
    }
    return items.filter((it) => it.qos_policy_id === qos_policy_id);
  }

  @action
  async fetchListWithResourceName({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    const allData = await this.fetchListByPage({
      limit,
      page,
      sortKey,
      sortOrder,
      conditions,
      timeFilter,
      ...filters,
    });
    const promises = [];
    allData.forEach((data) => {
      if (
        data.port_details &&
        data.port_details.device_owner === 'network:router_gateway'
      ) {
        promises.push(
          globalRouterStore.fetchDetail({ id: data.port_details.device_id })
        );
      } else if (
        data.port_details &&
        data.port_details.device_owner === 'compute:nova'
      ) {
        promises.push(
          globalServerStore.fetchDetailWithoutExpiration({
            id: data.port_details.device_id,
          })
        );
      } else if (
        data.port_details &&
        data.port_details.device_owner === 'Octavia'
      ) {
        promises.push(
          globalLbaasStore.fetchDetail({
            id: data.port_details.device_id.replace('lb-', ''),
          })
        );
      } else if (data.port_details && data.port_details.device_owner === '') {
        promises.push(
          Promise.resolve({
            name: data.port_details.name,
          })
        );
      } else {
        promises.push(Promise.resolve({}));
      }
    });
    const results = await Promise.allSettled(promises);
    results.forEach(({ status, value: result }, index) => {
      let resource_name = '-';
      if (status === 'fulfilled') {
        if (
          allData[index].port_details &&
          allData[index].port_details.device_owner === 'compute:nova'
        ) {
          resource_name = `${result.name}: ${allData[index].fixed_ip_address}`;
        } else if (
          allData[index].port_details &&
          (allData[index].port_details.device_owner ===
            'network:router_gateway' ||
            allData[index].port_details.device_owner === '')
        ) {
          resource_name = `${result.name}: ${allData[index].fixed_ip_address}`;
        } else if (
          allData[index].port_details &&
          allData[index].port_details.device_owner === 'Octavia'
        ) {
          resource_name = `${result.name}: ${allData[index].fixed_ip_address}`;
        }
      } else {
        // deal with resources from other projects
        resource_name = `${t('Resource Id')}: ${
          allData[index].port_details.device_id
        } `;
      }
      allData[index].resource_name = resource_name;
    });
    this.list.update({
      data: allData,
    });

    return allData;
  }

  @action
  disassociateFip({ id }) {
    const body = {
      floatingip: {
        port_id: null,
      },
    };
    return this.submitting(this.client.update(id, body));
  }

  @action
  associateFip({ id, port_id, fixed_ip_address = '' }) {
    const body = {
      floatingip: {
        port_id,
      },
    };
    if (fixed_ip_address !== '') {
      body.floatingip.fixed_ip_address = fixed_ip_address;
    }
    return this.submitting(this.client.update(id, body));
  }

  @action
  async getAddInfo({ router_id }) {
    this.isLoading = true;
    try {
      this.addInfo = await globalRouterStore.fetchDetail({ id: router_id });
    } finally {
      this.isLoading = false;
    }
    return this.addInfo;
  }
}

const globalFloatingIpsStore = new FloatingIpStore();
export default globalFloatingIpsStore;
