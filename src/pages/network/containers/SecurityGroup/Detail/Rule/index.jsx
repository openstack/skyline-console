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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalSecurityGroupRuleStore from 'stores/neutron/security-rule';
import {
  filterParams,
  getSelfColumns,
} from 'resources/neutron/security-group-rule';
import { getPath } from 'utils/route-map';
import actionConfigs from './actions';

export class Rule extends Base {
  init() {
    this.store = globalSecurityGroupRuleStore;
  }

  get policy() {
    return 'get_security_group_rule';
  }

  get name() {
    return t('security group rules');
  }

  getDetailUrl(id) {
    const key = this.isAdminPage
      ? 'securityGroupDetailAdmin'
      : 'securityGroupDetail';
    return getPath({ key, params: { id } });
  }

  getColumns = () => getSelfColumns(this);

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get searchFilters() {
    return filterParams;
  }

  async getData({ silent, ...params } = {}) {
    const { detail = {} } = this.props;
    const { id } = detail;
    silent && (this.list.silent = true);
    if (id) {
      await this.store.fetchList({ ...params, security_group_id: id });
    }
    this.list.silent = false;
  }
}

export default inject('rootStore')(observer(Rule));
