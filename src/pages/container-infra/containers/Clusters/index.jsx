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
import globalClustersStore from 'src/stores/magnum/clusters';
import actionConfigs from './actions';

export class Clusters extends Base {
  init() {
    this.store = globalClustersStore;
    this.downloadStore = globalClustersStore;
  }

  get name() {
    return t('clusters');
  }

  get policy() {
    return 'container-infra:cluster:get_all';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get rowKey() {
    return 'uuid';
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('containerInfraClusterDetail'),
    },
    {
      title: t('Status'),
      isHideable: true,
      dataIndex: 'status',
    },
    {
      title: t('Health Status'),
      isHideable: true,
      dataIndex: 'health_status',
    },
    {
      title: t('Keypair'),
      isHideable: true,
      dataIndex: 'keypair',
    },
  ];
}

export default inject("rootStore")(observer(Clusters))