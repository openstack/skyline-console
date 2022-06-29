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
import ModalAction from 'containers/Action/ModalAction';
import globalInstancesDatabases from 'stores/trove/instances-database';

export class DatabaseCreate extends ModalAction {
  init() {
    this.store = globalInstancesDatabases;
  }

  static id = 'create-database';

  static title = t('Create Database');

  get name() {
    return t('Create Database');
  }

  static policy = 'instance:extension:database:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get formItems() {
    return [
      {
        name: 'databaseName',
        label: t('Name'),
        type: 'input-name',
        required: true,
        isDatabaseName: true,
        maxLength: 64,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.create(id, {
      databases: [
        {
          character_set: 'utf8',
          collate: 'utf8_general_ci',
          name: values.databaseName,
        },
      ],
    });
  };
}

export default inject('rootStore')(observer(DatabaseCreate));
