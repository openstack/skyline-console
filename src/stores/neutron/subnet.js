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
import client from 'client';
import Base from 'stores/base';

export class SubnetStore extends Base {
  get client() {
    return client.neutron.subnets;
  }

  get listFilterByProject() {
    return false;
  }

  get portClient() {
    return client.neutron.ports;
  }

  get paramsFunc() {
    return (params) => {
      const { network, all_projects, ...rest } = params;
      return rest;
    };
  }

  @action
  async update({ id }, values) {
    const {
      host_routes,
      allocation_pools,
      project_id,
      subnet_name,
      enable_dhcp,
      gateway_ip,
      dns_nameservers,
    } = values;
    const data = {
      project_id,
      name: subnet_name,
      enable_dhcp,
      dns_nameservers,
      allocation_pools,
      host_routes,
      gateway_ip,
    };
    return this.submitting(this.client.update(id, { subnet: data }));
  }

  async listDidFetch(items, allProjects, filters) {
    if (!items.length) {
      return items;
    }
    const {
      network: { id: networkId, subnet_ip_availability: ipUsage = [] } = {},
    } = filters;
    const portParams = {
      network_id: networkId,
    };
    if (!allProjects) {
      portParams.tenant_id = this.currentProjectId;
    }
    const { ports = [] } = await this.portClient.list(portParams);
    return items.map((it) => {
      const ipInfo = ipUsage.find((u) => u.subnet_id === it.id);
      const subnetPorts = ports.filter((port) => {
        return port.fixed_ips.find((ip) => ip.subnet_id === it.id);
      });
      const { total_ips, used_ips } = ipInfo || {};
      return {
        ...it,
        total_ips,
        used_ips,
        subnetPorts,
      };
    });
  }

  async detailDidFetch(item, allProjects, filters) {
    const { inDetail = false, canAddNetworkIPUsageInfo = false } = filters;
    if (!inDetail) {
      return item;
    }
    const { network_id, id } = item;
    const networkParams = {
      id: network_id,
      isAdminPage: allProjects,
      canAddNetworkIPUsageInfo,
    };
    const { NetworkStore } = require('stores/neutron/network');
    const network =
      await new NetworkStore().fetchDetailWithAvailabilityAndUsage(
        networkParams
      );
    const { subnet_ip_availability = [] } = network;
    const ipAvailability = subnet_ip_availability.find(
      (it) => it.subnet_id === id
    );
    return {
      ...item,
      network,
      ...ipAvailability,
    };
  }
}

const globalSubnetStore = new SubnetStore();
export default globalSubnetStore;
