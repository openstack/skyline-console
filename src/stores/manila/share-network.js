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

export class ShareNetworkStore extends Base {
  get client() {
    return client.manila.shareNetworks;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get listWithDetail() {
    return true;
  }

  get paramsFunc() {
    return (params) => {
      const { all_projects, keywords, ...rest } = params;
      return {
        ...rest,
        all_tenants: all_projects ? 1 : 0,
      };
    };
  }

  async detailDidFetch(item) {
    const { share_network_subnets: subnets = [] } = item;
    const subnetIds = subnets.map((it) => it.neutron_subnet_id);
    const networkIds = subnets.map((it) => it.neutron_net_id);
    const subnetReqs = Array.from(new Set(subnetIds)).map((it) => {
      return this.subnetClient.show(it);
    });
    const netReqs = Array.from(new Set(networkIds)).map((it) => {
      return this.networkClient.show(it);
    });
    const subnetResults = await Promise.all(subnetReqs);
    const netResults = await Promise.all(netReqs);
    return {
      ...item,
      subnets: subnets
        .map((it) => {
          return subnetResults.find(
            (s) => s.subnet.id === it.neutron_subnet_id
          );
        })
        .map((it) => it.subnet),
      networks: subnets
        .map((it) => {
          return netResults.find((net) => net.network.id === it.neutron_net_id);
        })
        .map((it) => it.network),
    };
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }
}

const globalShareNetworkStore = new ShareNetworkStore();
export default globalShareNetworkStore;
