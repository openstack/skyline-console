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

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class ShareStore extends Base {
  @observable
  zones = [];

  @observable
  zoneOptions = [];

  @observable
  quotaSet = {};

  get client() {
    return client.manila.shares;
  }

  get zoneClient() {
    return client.manila.azones;
  }

  get accessClient() {
    return client.manila.shareAccessRules;
  }

  get quotaClient() {
    return client.manila.quotaSets;
  }

  get shareGroupClient() {
    return client.manila.shareGroups;
  }

  get shareNetworkClient() {
    return client.manila.shareNetworks;
  }

  get listWithDetail() {
    return true;
  }

  parseMarker() {
    return '';
  }

  updateMarkerParams = (limit, marker) => ({
    limit,
    offset: marker,
  });

  get paramsFuncPage() {
    return (params) => {
      const { current = 1, all_projects, limit = 10, ...rest } = params;
      const marker = current === 1 ? '' : (current - 1) * limit;
      return {
        ...rest,
        // with_count: 'True',
        all_tenants: all_projects ? 1 : 0,
        offset: marker,
        limit,
      };
    };
  }

  @action
  async fetchAvailableZones() {
    const { availability_zones: zones = [] } = await this.zoneClient.list();
    this.zones = zones;
    this.zoneOptions = zones.map((it) => {
      return {
        value: it.id,
        label: it.name,
      };
    });
  }

  async detailDidFetch(item) {
    const { id, share_group_id, share_network_id } = item || {};
    const newItem = { ...item };
    const reqs = [
      this.client.exportLocations.list(id),
      this.accessClient.list({ share_id: id }),
      share_group_id ? this.shareGroupClient.show(share_group_id) : null,
      share_network_id ? this.shareNetworkClient.show(share_network_id) : null,
    ];
    const [exportLocationResult, accessResult, groupResult, networkResult] =
      await Promise.all(reqs);
    newItem.exportLocations = exportLocationResult.export_locations;
    if (share_group_id) {
      newItem.shareGroup = groupResult.share_group;
    }
    if (share_network_id) {
      newItem.shareNetwork = networkResult.share_network;
    }
    newItem.accessList = accessResult.access_list;
    return newItem;
  }

  @action
  async fetchQuota() {
    const result = await this.quotaClient.showDetail(this.currentProjectId);
    this.quotaSet = result.quota_set;
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }
}

const globalShareStore = new ShareStore();
export default globalShareStore;
