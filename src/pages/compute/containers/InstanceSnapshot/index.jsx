// Copyright 2022 99cloud
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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { transitionStatusList } from 'resources/glance/image';
import globalInstanceSnapshotStore, {
  InstanceSnapshotStore,
} from 'stores/glance/instance-snapshot';
import { emptyActionConfig } from 'utils/constants';
import { getBaseSnapshotColumns } from 'resources/glance/instance-snapshot';
import actionConfigs from './actions';

export class Snapshots extends Base {
  init() {
    this.store = this.inDetailPage
      ? new InstanceSnapshotStore()
      : globalInstanceSnapshotStore;
    this.downloadStore = this.inDetailPage
      ? this.store
      : new InstanceSnapshotStore();
  }

  get policy() {
    return 'get_images';
  }

  get name() {
    return t('instance snapshots');
  }

  get isRecycleBinDetail() {
    return this.path.includes('recycle-bin');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return transitionStatusList;
  }

  get isFilterByBackend() {
    return false;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get projectFilterKey() {
    return 'owner';
  }

  updateFetchParams = (params) => ({
    ...params,
    owner: this.inDetailPage ? this.props.detail.tenant_id : null,
  });

  get currentProjectId() {
    return this.props.detail.tenant_id;
  }

  getColumns = () => getBaseSnapshotColumns(this);

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: [
          { label: t('Active'), key: 'active' },
          { label: t('Saving'), key: 'saving' },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(Snapshots));
