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
import Base from 'containers/List';
import { SubnetStore } from 'stores/neutron/subnet';
import actionConfigs from './actions';
// import { networkStatus } from 'resources/network';

export class Subnets extends Base {
  init() {
    this.store = new SubnetStore();
  }

  get policy() {
    return 'get_subnet';
  }

  get name() {
    return t('subnets');
  }

  get id() {
    return this.params.id;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  updateFetchParams = () => {
    return {
      network_id: this.id,
      network: this.props.detail,
      all_projects: this.isAdminPage,
    };
  };

  get canAddNetworkIPUsageInfo() {
    return this.store.hasAdminRole;
  }

  getColumns = () => {
    const ret = [
      {
        title: t('Subnet ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('subnetDetail'),
        routeParamsFunc: (data) => ({
          networkId: data.network_id,
          id: data.id,
        }),
      },
      {
        title: t('CIDR'),
        dataIndex: 'cidr',
        isHideable: true,
      },
      {
        title: t('Gateway IP'),
        dataIndex: 'gateway_ip',
        isHideable: true,
      },
      {
        title: t('IP Version'),
        dataIndex: 'ip_version',
        isHideable: true,
      },
      {
        title: t('Port Count'),
        dataIndex: 'subnetPorts',
        isHideable: true,
        stringify: (value) => (value || []).length,
        render: (value, record) => {
          const count = (value || []).length;
          if (!count) {
            return '-';
          }
          const link = this.getLinkRender(
            'subnetDetail',
            count,
            { id: record.id, networkId: record.network_id },
            { tab: 'ports' }
          );
          return <>{link}</>;
        },
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
        isHideable: true,
      },
    ];
    if (this.canAddNetworkIPUsageInfo) {
      ret.splice(
        5,
        0,
        {
          title: t('Total IPs'),
          dataIndex: 'total_ips',
        },
        {
          title: t('Used IPs'),
          dataIndex: 'used_ips',
          titleTip: this.isAdminPage
            ? ''
            : t('Number of IPs used by all projects'),
        }
      );
    }
    return ret;
  };

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Subnets));
