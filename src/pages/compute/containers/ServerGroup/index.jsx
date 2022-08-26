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
import globalServerGroupStore from 'stores/nova/server-group';
import policyType from 'resources/nova/server-group';
import { getOptions } from 'utils';
import actionConfigs from './actions';

export class ServerGroup extends Base {
  init() {
    this.store = globalServerGroupStore;
  }

  get policy() {
    if (this.isAdminPage) {
      return 'os_compute_api:os-server-groups:index';
    }
    return 'os_compute_api:os-server-groups:index';
  }

  get name() {
    return t('server groups');
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('serverGroupDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
    },
    {
      title: t('Member Count'),
      dataIndex: 'members',
      isHideable: true,
      render: (value) => value.length,
    },
    {
      title: t('Policy'),
      dataIndex: 'policy',
      valueMap: policyType,
    },
  ];

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Policy'),
        name: 'policy',
        options: getOptions(policyType),
      },
    ];
  }
}

export default inject('rootStore')(observer(ServerGroup));
