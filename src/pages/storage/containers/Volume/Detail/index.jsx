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
import { VolumeStore } from 'stores/cinder/volume';
import Base from 'containers/TabDetail';
import Backup from 'pages/storage/containers/Backup';
import Snapshot from 'pages/storage/containers/Snapshot';
import { volumeStatus } from 'resources/cinder/volume';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class VolumeDetail extends Base {
  get name() {
    return t('volume');
  }

  get policy() {
    return 'volume:get';
  }

  get listUrl() {
    return this.getRoutePath('volume');
  }

  getActionData() {
    return this.detailData.itemInList || {};
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.adminConfig;
    }
    return actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Shared'),
        dataIndex: 'multiattach',
        valueRender: 'yesNo',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: volumeStatus,
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        unit: 'GiB',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Type'),
        dataIndex: 'volume_type',
      },
      {
        title: t('Encrypted'),
        dataIndex: 'encrypted',
        valueRender: 'yesNo',
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
      {
        title: t('Volume Backups'),
        key: 'backup',
        component: Backup,
      },
      {
        title: t('Volume Snapshots'),
        key: 'snapshot',
        component: Snapshot,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new VolumeStore();
  }
}

export default inject('rootStore')(observer(VolumeDetail));
