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

import { inject, observer } from 'mobx-react';
import Base from 'containers/TabDetail';
import { SubnetStore } from 'stores/neutron/subnet';
import Port from 'pages/network/containers/Port';
import Detail from './Detail';
import actionConfigs from '../actions';

export class SubnetDetail extends Base {
  get name() {
    return t('subnet');
  }

  get policy() {
    return 'get_subnet';
  }

  get listUrl() {
    const { networkId } = this.params;
    return this.getRoutePath(
      'networkDetail',
      { id: networkId },
      { tab: 'subnets' }
    );
  }

  get actionConfigs() {
    return actionConfigs;
  }

  updateFetchParams = (params) => {
    return {
      ...params,
      inDetail: true,
      canAddNetworkIPUsageInfo: this.store.hasAdminRole,
    };
  };

  get detailInfos() {
    const ret = [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        title: t('CIDR'),
        dataIndex: 'cidr',
      },
      {
        title: t('IP Version'),
        dataIndex: 'ip_version',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Update At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
    return ret;
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: Detail,
      },
      {
        title: t('Ports'),
        key: 'ports',
        component: Port,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new SubnetStore();
  }
}

export default inject('rootStore')(observer(SubnetDetail));
