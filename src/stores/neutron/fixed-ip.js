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
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import client from 'client';
import Base from 'stores/base';

export class FixedIpStore extends Base {
  get client() {
    return client.neutron.ports;
  }

  get paramsFunc() {
    return ({ all_projects, networkId, instanceId, subnetId, ...rest }) => rest;
  }

  async getItemFloatingIPs(fixed_ip, portId) {
    return globalFloatingIpsStore.pureFetchList({
      fixed_ip_address: fixed_ip,
      port_id: portId,
    });
  }

  async listDidFetch(items) {
    if (items.length === 0) {
      return [];
    }
    const port = items[0];
    const { fixed_ips: fixedIPs = [], id } = port;
    const subnets = Array.from(new Set(fixedIPs.map((it) => it.subnet_id)));
    const subnetResults = await Promise.all(
      subnets.map((item) => globalNetworkStore.fetchSubnetDetail({ id: item }))
    );
    const subnetMap = {};
    subnetResults.forEach((result) => {
      subnetMap[result.id] = result;
    });
    const fipResults = await Promise.all(
      fixedIPs.map((item) => this.getItemFloatingIPs(item.ip_address, id))
    );
    return fixedIPs.map((it, index) => ({
      ...it,
      subnet: subnetMap[it.subnet_id],
      fip: fipResults[index],
      port,
    }));
  }
}

const globalFixedIpStore = new FixedIpStore();
export default globalFixedIpStore;
