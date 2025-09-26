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
import { LbaasStore } from 'stores/octavia/loadbalancer';
import { provisioningStatusCodes } from 'resources/octavia/lb';
import Listeners from '../../Listener';
import { actionConfigs, adminActions } from '../actions';

export class LoadBalancerDetail extends Base {
  get name() {
    return t('load balancer');
  }

  get policy() {
    return 'os_load-balancer_api:loadbalancer:get_one';
  }

  fetchData = (params) => {
    if (this.store.fetchDetailWithFip) {
      const newParams = {
        ...this.params,
        ...(params || {}),
        silent: true,
        all_projects: this.isAdminPage,
      };
      this.store.fetchDetailWithFip(newParams).catch(this.catch);
    }
  };

  get listUrl() {
    return this.getRoutePath('lb');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminActions;
    }
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Status'),
        dataIndex: 'provisioning_status',
        valueMap: provisioningStatusCodes,
      },
      {
        title: t('Network'),
        dataIndex: 'vip_network_id',
      },
      {
        title: t('Subnet'),
        dataIndex: 'vip_subnet_id',
      },
      {
        title: t('Flavor'),
        dataIndex: 'flavor_id',
      },
      {
        title: t('IP'),
        dataIndex: 'vip_address',
      },
      {
        title: t('Floating IP'),
        dataIndex: 'fip',
      },
      {
        title: t('Provider'),
        dataIndex: 'provider',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Listeners'),
        key: 'listener',
        component: Listeners,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new LbaasStore();
  }
}

export default inject('rootStore')(observer(LoadBalancerDetail));
