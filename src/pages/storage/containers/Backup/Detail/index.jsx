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

import { inject, observer } from 'mobx-react';
import globalBackupStore from 'stores/cinder/backup';
import Base from 'containers/TabDetail';
import { backupStatus } from 'resources/cinder/backup';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('volume backup');
  }

  get policy() {
    return 'backup:get';
  }

  get listUrl() {
    return this.getRoutePath('backup');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Volume ID'),
        dataIndex: 'volume_id',
      },
      {
        title: t('Backup Mode'),
        dataIndex: 'is_incremental',
        isHideable: true,
        render: (value) => (value ? t('Incremental Backup') : t('Full Backup')),
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        unit: 'GiB',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: backupStatus,
      },
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
        valueRender: 'noValue',
        hidden: !this.isAdminPage,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'base',
        component: BaseDetail,
      },
    ];
    return tabs;
  }

  init() {
    this.store = globalBackupStore;
  }
}

export default inject('rootStore')(observer(Detail));
