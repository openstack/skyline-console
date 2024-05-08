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
import { FirewallRuleStore } from 'stores/neutron/firewall-rule';
import { tableFilter, tableColumns } from 'resources/neutron/firewall-rule';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class Rule extends Base {
  init() {
    this.store = new FirewallRuleStore();
  }

  get policy() {
    return 'get_firewall_rule';
  }

  get name() {
    return t('firewall rules');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return this.inDetailPage
        ? emptyActionConfig
        : actionConfigs.actionConfigsAdmin;
    }
    return this.inDetailPage
      ? actionConfigs.actionConfigsInDetail
      : actionConfigs.actionConfigs;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns() {
    const nameColumn = {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('firewallRuleDetail'),
    };
    const projectColumn = {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      hidden: !this.isAdminPage,
      isHideable: true,
    };
    const policyColumn = {
      title: t('Related Policy'),
      dataIndex: 'policies',
      isHideable: true,
      render: (value) =>
        value.map((it) => (
          <div key={it.id}>
            {this.getLinkRender('firewallPolicyDetail', it.name, { id: it.id })}
          </div>
        )),
      stringify: (value) => value.map((it) => it.name).join(','),
    };

    const columns = [
      nameColumn,
      projectColumn,
      ...tableColumns.slice(1, 2),
      policyColumn,
      ...tableColumns.slice(2, tableColumns.length),
    ];

    return columns;
  }

  get searchFilters() {
    return tableFilter;
  }

  async getData({ silent, ...params } = {}) {
    const { detail: { firewall_rules = [] } = {}, match } = this.props;
    const { path } = match;
    const newParams = { ...params };
    if (this.isAdminPage) {
      newParams.all_projects = true;
    }
    silent && (this.list.silent = true);
    this.fetchListWithTry(async () => {
      if (path.indexOf('firewall-policy') >= 0) {
        newParams.firewall_rules = firewall_rules;
        await this.store.fetchListByPolicy(newParams);
      } else {
        await this.store.fetchList(newParams);
      }
      this.list.silent = false;
    });
  }
}

export default inject('rootStore')(observer(Rule));
