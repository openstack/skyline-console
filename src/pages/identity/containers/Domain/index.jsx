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
import globalDomainStore from 'stores/keystone/domain';
import { enabledColumn } from 'resources/keystone/domain';
import actionConfigs from './actions';

export class Domains extends Base {
  init() {
    this.store = globalDomainStore;
  }

  get policy() {
    return 'identity:list_domains';
  }

  get name() {
    return t('domains');
  }

  get isFilterByBackend() {
    return false;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Domain ID/Name'),
      dataIndex: 'name',
      routeName: 'domainDetailAdmin',
    },
    {
      title: t('Project Num'),
      dataIndex: 'projectCount',
      isHideable: true,
    },
    {
      title: t('User Num'),
      dataIndex: 'userCount',
      isHideable: true,
    },
    {
      title: t('User Group Num'),
      dataIndex: 'groupCount',
      isHideable: true,
    },
    enabledColumn,
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Domain Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Domains));
