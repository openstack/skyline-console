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

export class SnapshotStore extends Base {
  @observable
  currentVolumeType = null;

  get client() {
    return client.cinder.snapshots;
  }

  get volumeClient() {
    return client.cinder.volumes;
  }

  get listResponseKey() {
    return 'volume_snapshots';
  }

  listFetchByClient(params) {
    return this.skylineClient.extension.volumeSnapshots(params);
  }

  get paramsFunc() {
    return (params) => {
      const { id, ...rest } = params;
      return rest;
    };
  }

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { id } = filters;
    const data = id ? items.filter((it) => it.volume_id === id) : items;
    return data;
  }

  async detailDidFetch(item, allProjects) {
    const params = {
      uuid: item.id,
    };
    if (allProjects) {
      params.all_projects = true;
    }
    const { volume_snapshots = [] } = await this.listFetchByClient(params);
    const { child_volumes = [], volume_name } = volume_snapshots[0] || {};
    return { ...item, child_volumes, volume_name };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  @action
  update(id, data) {
    const body = { [this.responseKey]: data };
    return this.submitting(this.client.update(id, body));
  }

  @action
  setCurrentVolumeType(volume) {
    const { volume_type } = volume || {};
    this.currentVolumeType = volume_type;
  }
}
const globalSnapshotStore = new SnapshotStore();
export default globalSnapshotStore;
