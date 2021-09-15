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

@inject('rootStore')
@observer
export default class Domains extends Base {
  init() {
    this.store = globalDomainStore;
  }

  get tabs() {
    return [];
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

  getColumns = () => [
    {
      title: t('Domain ID/Name'),
      dataIndex: 'name',
      // isHideable: true,
      linkPrefix: '/identity/domain-admin/detail',
    },
    {
      title: t('Member Num'),
      dataIndex: 'user_num',
      isHideable: true,
      render: (user_num) => `${t('User Num: ')}${user_num}`,
    },
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
