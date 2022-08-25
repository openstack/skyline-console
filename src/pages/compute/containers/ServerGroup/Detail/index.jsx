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
import { ServerGroupStore } from 'stores/nova/server-group';
import Base from 'containers/TabDetail';
import Members from 'pages/compute/containers/Instance';
import policyType from 'resources/nova/server-group';
import actionConfigs from '../actions';

export class ServerGroupDetail extends Base {
  get name() {
    return t('server group');
  }

  get policy() {
    return 'os_compute_api:os-server-groups:show';
  }

  get listUrl() {
    return this.getRoutePath('serverGroup');
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
        hidden: !this.isAdminPage,
      },
      {
        title: t('Policy'),
        dataIndex: 'policy',
        valueMap: policyType,
      },
      {
        title: t('Member Count'),
        dataIndex: 'members',
        render: (value) => value.length,
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Members'),
        key: 'members',
        component: Members,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new ServerGroupStore();
  }
}

export default inject('rootStore')(observer(ServerGroupDetail));
