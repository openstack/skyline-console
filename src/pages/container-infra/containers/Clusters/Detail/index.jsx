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
import Base from 'containers/TabDetail';
import { clusterStatus, healthStatus } from 'resources/magnum/cluster';
import globalClustersStore from 'src/stores/magnum/clusters';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class ClustersDetail extends Base {
  init() {
    this.store = globalClustersStore;
  }

  get name() {
    return t('Cluster Detail');
  }

  get listUrl() {
    return this.getRoutePath('containerInfraClusters');
  }

  get policy() {
    return 'cluster:detail';
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
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
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: clusterStatus,
      },
      {
        title: t('Status Reason'),
        dataIndex: 'status_reason',
      },
      {
        title: t('Health Status'),
        dataIndex: 'health_status',
        render: (value) => healthStatus[value] || value || '-',
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'general_info',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(ClustersDetail));
