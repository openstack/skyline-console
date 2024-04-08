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
import { FirewallRuleStore } from 'stores/neutron/firewall-rule';
import Base from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class FirewallRuleDetail extends Base {
  get name() {
    return t('firewall rule');
  }

  get policy() {
    return 'get_firewall_rule';
  }

  get listUrl() {
    return this.getRoutePath('firewall', null, { tab: 'rules' });
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
        title: t('Project ID'),
        dataIndex: 'tenant_id',
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
        title: t('Base Info'),
        key: 'base',
        component: BaseDetail,
      },
      // {
      //   title: t('Rules'),
      //   key: 'rules',
      //   component: members,
      // },
    ];
    return tabs;
  }

  init() {
    this.store = new FirewallRuleStore();
  }
}

export default inject('rootStore')(observer(FirewallRuleDetail));
