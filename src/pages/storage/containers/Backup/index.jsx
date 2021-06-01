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

import React from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import Base from 'containers/List';
import globalBackupStore, { BackupStore } from 'stores/cinder/backup';
import CreateBackup from 'pages/storage/containers/Volume/actions/CreateBackup';
import { FolderOutlined, FolderAddOutlined } from '@ant-design/icons';
import { backupStatus } from 'resources/backup';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class Backup extends Base {
  get name() {
    return t('Backups');
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
    if (this.isInDetailPage) {
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
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  init() {
    this.store = globalBackupStore;
    this.downloadStore = new BackupStore();
  }

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        linkPrefix: `/storage/${this.getUrl('backup')}/detail`,
        sortKey: 'id',
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        sortKey: 'project_id',
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        isHideable: true,
        render: (value) => `${value} GB`,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (value) => backupStatus[value] || value,
      },
      {
        title: t('Backup Mode'),
        dataIndex: 'is_incremental',
        isHideable: true,
        render: (value) => {
          if (value) {
            return (
              <>
                <FolderAddOutlined />
                <span style={{ marginLeft: 8 }}>{t('Incremental Backup')}</span>
              </>
            );
          }
          return (
            <>
              <FolderOutlined />
              <span style={{ marginLeft: 8 }}>{t('Full Backup')}</span>
            </>
          );
        },
        stringify: (value) =>
          value ? t('Incremental Backup') : t('Full Backup'),
      },
      {
        title: t('Volume ID'),
        dataIndex: 'volume_id',
        render: (value) => (
          <Link to={`${this.getUrl('/storage/volume')}/detail/${value}`}>
            {value}
          </Link>
        ),
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
    if (this.isInDetailPage) {
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
      {
        label: t('Volume ID'),
        name: 'volume_id',
      },
    ];
  }

  updateFetchParamsByPage = (params) => {
    if (this.isInDetailPage) {
      const { id, ...rest } = params;
      return {
        volume_id: id,
        ...rest,
      };
    }
    return params;
  };
}
