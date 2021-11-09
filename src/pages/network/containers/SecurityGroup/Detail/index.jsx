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
import { SecurityGroupStore } from 'stores/neutron/security-group';
import Base from 'containers/TabDetail';
import { isEqual } from 'lodash';
import members from './Rule';
import actionConfigs from '../actions';

export class SecurityGroupDetail extends Base {
  get name() {
    return t('security group');
  }

  get policy() {
    return 'get_security_group';
  }

  get listUrl() {
    return this.getRoutePath('securityGroup');
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
        dataIndex: 'tenant_id',
        hidden: !this.isAdminPage,
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
        title: t('Rules'),
        key: 'rules',
        component: members,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new SecurityGroupStore();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.match.params, prevProps.match.params)) {
      this.fetchDataWithPolicy();
    }
  }
}

export default inject('rootStore')(observer(SecurityGroupDetail));
