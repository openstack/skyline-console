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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalBackupStore, { BackupStore } from 'stores/cinder/backup';
import CreateBackup from 'pages/storage/containers/Volume/actions/CreateBackup';
import { backupStatus } from 'resources/cinder/backup';
import actionConfigs from './actions';

export class Backup extends Base {
  get name() {
    return t('volume backups');
  }

  get policy() {
    return 'backup:get_all';
  }

  get actionConfigs() {
    const { actionConfigsAdmin, actionConfigs: actionConfigsProject } =
      actionConfigs;
    if (this.isAdminPage) {
      return actionConfigsAdmin;
    }
    if (this.inDetailPage) {
      return {
        ...actionConfigsProject,
        primaryActions: [CreateBackup],
      };
    }
    return actionConfigsProject;
  }

  get adminPageHasProjectFilter() {
    return true;
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

  init() {
    this.store = this.inDetailPage ? new BackupStore() : globalBackupStore;
    this.downloadStore = new BackupStore();
  }

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('backupDetail'),
        sortKey: 'id',
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        sortKey: 'project_id',
      },
      {
        title: t('Volume ID/Name'),
        dataIndex: 'volume_name',
        isLink: true,
        routeQuery: { tab: 'backup' },
        routeName: this.getRouteName('volumeDetail'),
        idKey: 'volume_id',
        sortKey: 'volume_id',
      },
      {
        title: t('Backup Mode'),
        dataIndex: 'is_incremental',
        isHideable: true,
        render: (value) => (value ? t('Incremental Backup') : t('Full Backup')),
        sorter: false,
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        isHideable: true,
        unit: 'GiB',
        sorter: false,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        isHideable: true,
        valueMap: backupStatus,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
    if (this.inDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'volume_name');
    }
    return columns;
  };

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }

  // `updateFetchParamsByPage` is not called when `isFilterByBackend` is false,
  // so this ensures the `volume_id` parameter is included on the detail page.
  updateFetchParams = (params) => {
    if (this.inDetailPage) {
      const { id, ...rest } = params;
      return {
        volume_id: id,
        ...rest,
      };
    }
    return params;
  };

  updateFetchParamsByPage = (params) => {
    if (this.inDetailPage) {
      const { id, ...rest } = params;
      return {
        volume_id: id,
        ...rest,
      };
    }
    return params;
  };
}

export default inject('rootStore')(observer(Backup));
