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

import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import { getOptions } from 'utils';
import { clusterStatus, healthStatus } from 'resources/magnum/cluster';
import { ClustersStore } from 'stores/magnum/clusters';
import { ClustersAdminStore } from 'stores/magnum/clusterAdmin';
import actionConfigs from './actions';

export class Clusters extends Base {
  init() {
    if (this.isAdminPage) {
      this.store = new ClustersAdminStore();
    } else {
      this.store = new ClustersStore();
    }
  }

  get name() {
    return t('clusters');
  }

  get policy() {
    return 'cluster:get_all';
  }

  get fetchDataByAllProjects() {
    return false;
  }

  updateFetchParams = (params) => {
    return {
      ...params,
      shouldFetchProject: this.isAdminPage,
    };
  };

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    return actionConfigs.actionConfigs;
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('containerInfraClusterDetail'),
      },
      {
        title: t('Status'),
        isHideable: true,
        dataIndex: 'status',
        valueMap: clusterStatus,
      },
      {
        title: t('Health Status'),
        isHideable: true,
        dataIndex: 'health_status',
        render: (value) => healthStatus[value] || value || '-',
        isStatus: false,
      },
      {
        title: t('Keypair'),
        isHideable: true,
        dataIndex: 'keypair',
        hidden: this.isAdminPage,
        render: (value) => {
          return value
            ? this.getLinkRender('keypairDetail', value, { id: value })
            : '-';
        },
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(clusterStatus),
      },
      {
        label: t('Health Status'),
        name: 'health_status',
        options: getOptions(healthStatus),
      },
    ];
  }
}

export default inject('rootStore')(observer(Clusters));
