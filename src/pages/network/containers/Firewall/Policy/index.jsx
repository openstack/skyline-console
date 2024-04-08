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
import globalFirewallPolicyStore from 'stores/neutron/firewall-policy';
import { yesNoOptions } from 'utils/constants';
import { getDefaultFilter } from 'resources/neutron/firewall';
import actionConfigs from './actions';

export class Policy extends Base {
  init() {
    this.store = globalFirewallPolicyStore;
  }

  get policy() {
    return 'get_firewall_policy';
  }

  get name() {
    return t('firewall policies');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('firewallPolicyDetail'),
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        isHideable: true,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
      {
        title: t('Rules'),
        dataIndex: 'rules',
        isHideable: true,
        render: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item) => (
            <div key={item.id}>
              {this.getLinkRender('firewallRuleDetail', item.name, {
                id: item.id,
              })}
            </div>
          ));
        },
        stringify: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item) => item.name).join(', ');
        },
      },
      {
        title: t('Firewalls'),
        dataIndex: 'firewalls',
        isHideable: true,
        render: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item) => (
            <div key={item.id}>
              {this.getLinkRender('firewallDetail', item.name, { id: item.id })}
            </div>
          ));
        },
        stringify: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item) => item.name).join(', ');
        },
      },
      {
        title: t('Shared'),
        dataIndex: 'shared',
        valueRender: 'yesNo',
        width: 80,
      },
      {
        title: t('Audited'),
        dataIndex: 'audited',
        valueRender: 'yesNo',
        width: 100,
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
        label: t('Shared'),
        name: 'shared',
        options: yesNoOptions,
      },
      {
        label: t('Audited'),
        name: 'audited',
        options: yesNoOptions,
      },
      getDefaultFilter(t('Hide Default Policies')),
    ];
  }
}

export default inject('rootStore')(observer(Policy));
