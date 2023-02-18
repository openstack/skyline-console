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
import { NetworkStore } from 'stores/neutron/network';
import { networkStatus } from 'resources/neutron/network';
import Port from 'pages/network/containers/Port';
import Subnet from 'pages/network/containers/Subnet';
import Detail from './Detail';
import actionConfigs from '../actions';

export class NetworkDetail extends Base {
  get name() {
    return t('network');
  }

  get policy() {
    return 'get_network';
  }

  get listUrl() {
    return this.getRoutePath('network');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  fetchData = (params) => {
    if (this.store.fetchDetail) {
      const newParams = {
        ...this.params,
        ...(params || {}),
        all_projects: this.isAdminPage,
      };
      this.store
        .fetchDetailWithAvailabilityAndUsage({
          ...newParams,
          isAdminPage: this.isAdminPage,
          canAddNetworkIPUsageInfo: this.canAddNetworkIPUsageInfo,
        })
        .catch(this.catch);
    }
  };

  get canAddNetworkIPUsageInfo() {
    return this.store.hasAdminRole;
  }

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
        title: t('Status'),
        dataIndex: 'status',
        valueMap: networkStatus,
      },
      {
        title: t('Admin State'),
        dataIndex: 'admin_state_up',
        valueRender: 'yesNo',
      },
      {
        title: t('Shared'),
        dataIndex: 'shared',
        valueRender: 'yesNo',
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
    if (this.isAdminPage) {
      ret.splice(2, 0, {
        title: t('Project Name'),
        dataIndex: 'projectName',
      });
      ret.splice(7, 0, {
        title: t('DHCP Agents'),
        dataIndex: 'dhcp_agents',
      });
    }
    if (this.canAddNetworkIPUsageInfo) {
      ret.splice(
        4,
        0,
        {
          title: t('Total IPs'),
          dataIndex: 'total_ips',
        },
        {
          title: t('Used IPs'),
          dataIndex: 'used_ips',
        }
      );
    }
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
        title: t('Subnets'),
        key: 'subnets',
        component: Subnet,
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
    this.store = new NetworkStore();
  }
}

export default inject('rootStore')(observer(NetworkDetail));
