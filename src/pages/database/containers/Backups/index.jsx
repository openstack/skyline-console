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

import Base from 'containers/List';

import { inject, observer } from 'mobx-react';
import globalBackupsStore from 'stores/trove/backups';
import actions from './actions';

export class Backups extends Base {
  init() {
    this.store = globalBackupsStore;
  }

  get name() {
    return t('database backups');
  }

  get actionConfigs() {
    return actions.actionConfigs;
  }

  get policy() {
    return 'backup:index';
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('databaseBackupDetail'),
    },
    {
      title: t('Description'),
      isHideable: true,
      dataIndex: 'description',
    },
  ];
}

export default inject('rootStore')(observer(Backups));
