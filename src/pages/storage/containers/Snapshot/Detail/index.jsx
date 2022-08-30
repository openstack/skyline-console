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
import { SnapshotStore } from 'stores/cinder/snapshot';
import Base from 'containers/TabDetail';
import { volumeStatus } from 'resources/cinder/volume';
import Volumes from 'pages/storage/containers/Volume';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('volume snapshot');
  }

  get policy() {
    return 'volume:get_snapshot';
  }

  get listUrl() {
    return this.getRoutePath('snapshot');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
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
        valueRender: 'noValue',
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
    ];
  }

  get tabs() {
    const { child_volumes = [] } = this.detailData || {};
    const tabs = [
      {
        title: t('Detail'),
        key: 'base',
        component: BaseDetail,
      },
    ];
    if (child_volumes && child_volumes.length) {
      tabs.push({
        title: t('Created Volumes'),
        key: 'volumes',
        component: Volumes,
      });
    }
    return tabs;
  }

  init() {
    this.store = new SnapshotStore();
  }
}

export default inject('rootStore')(observer(Detail));
