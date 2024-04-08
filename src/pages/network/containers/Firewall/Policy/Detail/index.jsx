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
import { FirewallPolicyStore } from 'stores/neutron/firewall-policy';
import Base from 'containers/TabDetail';
import Rule from '../../Rule';
import actionConfigs from '../actions';

export class InstanceDetail extends Base {
  get name() {
    return t('policy');
  }

  get policy() {
    return 'get_firewall_policy';
  }

  get listUrl() {
    return this.getRoutePath('firewall', null, { tab: 'policies' });
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Shared'),
        dataIndex: 'shared',
        valueRender: 'yesNo',
      },
      {
        title: t('Audited'),
        dataIndex: 'audited',
        valueRender: 'yesNo',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Policy Rules'),
        key: 'rules',
        component: Rule,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new FirewallPolicyStore();
  }
}

export default inject('rootStore')(observer(InstanceDetail));
