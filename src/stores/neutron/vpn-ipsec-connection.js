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
import globalVpnIKEPolicyStore from 'stores/neutron/vpn-ike-policy';
import globalVpnIPsecPolicyStore from 'stores/neutron/vpn-ipsec-policy';
import client from 'client';
import Base from 'stores/base';

export class VpnIPsecConnectionStore extends Base {
  get client() {
    return client.neutron.ipsecSiteConnections;
  }

  get listFilterByProject() {
    return true;
  }

  @action
  async fetchDetailWithPolicyDetail({
    id,
    ikePolicyID,
    ipsecPolicyID,
    all_projects,
  }) {
    this.isLoading = true;
    const result = await this.client.show(
      id,
      this.getDetailParams({ all_projects })
    );
    const ikePolicy = await globalVpnIKEPolicyStore.fetchDetail({
      id: ikePolicyID,
    });
    const ipsecPolicy = await globalVpnIPsecPolicyStore.fetchDetail({
      id: ipsecPolicyID,
    });
    const originData = get(result, this.responseKey) || result;
    let item = this.mapperBeforeFetchProject(originData);
    item = {
      ...item,
      ikeDetail: ikePolicy,
      ipsecDetail: ipsecPolicy,
    };
    try {
      const newItem = await this.detailDidFetch(item, all_projects);
      const detail = this.mapper(newItem);
      this.detail = detail;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      this.detail = item;
    }
    this.isLoading = false;
    return this.detail;
  }
}

const globalVpnIPsecConnectionStore = new VpnIPsecConnectionStore();
export default globalVpnIPsecConnectionStore;
