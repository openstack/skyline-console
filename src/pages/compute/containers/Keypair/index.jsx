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
import keypairStore from 'stores/nova/keypair';
import actionConfigs from './actions';

export class Keypair extends Base {
  init() {
    this.store = keypairStore;
  }

  get policy() {
    return 'os_compute_api:os-keypairs:index';
  }

  get name() {
    return t('keypairs');
  }

  get hideCustom() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get rowKey() {
    return 'name';
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
      idKey: 'name',
      routeName: this.getRouteName('keypairDetail'),
      withoutId: true,
    },
    {
      title: t('Fingerprint'),
      dataIndex: 'fingerprint',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Keypair));
