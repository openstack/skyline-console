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
import { VolumeStore } from 'stores/cinder/volume';

export class BackupStore extends Base {
  @observable
  currentVolumeSize = 0;

  get client() {
    return client.cinder.backups;
  }

  get listWithDetail() {
    return true;
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      ...data,
      project_id: data.project_id || data['os-backup-project-attr:project_id'],
    });
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort = `${sortKey}:${sortOrder === 'descend' ? 'desc' : 'asc'}`;
    }
  };

  async detailDidFetch(item) {
    const { volume_id } = item;
    try {
      const volumeStore = new VolumeStore();
      const result = await volumeStore.fetchDetail({ id: volume_id });
      item.volume = result;
      item.volume_name = result.name;
    } catch (e) {}
    return item;
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, all_projects, ...rest } = params;
      return {
        all_tenants: all_projects,
        ...rest,
      };
    };
  }

  @action
  restore(id, data) {
    const body = { restore: data || {} };
    return this.submitting(this.client.restore(id, body));
  }

  @action
  setCurrentVolume(volume) {
    const { size = 0 } = volume || {};
    this.currentVolumeSize = size || 0;
  }
}
const globalBackupStore = new BackupStore();
export default globalBackupStore;
