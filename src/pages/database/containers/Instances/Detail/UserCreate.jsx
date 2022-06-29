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
import globalInstancesUsersStore from 'stores/trove/instances-user';
import { InstancesDatabasesStore } from 'stores/trove/instances-database';
import { getPasswordOtherRule } from 'utils/validate';

export class UserCreate extends ModalAction {
  async init() {
    this.store = globalInstancesUsersStore;
    this.databaseStore = new InstancesDatabasesStore();
    await this.fetchDatabase();
  }

  static id = 'create-user';

  static title = t('Create User');

  get name() {
    return t('Create User');
  }

  static policy = 'instance:extension:user:create';

  static allowed() {
    return Promise.resolve(true);
  }

  fetchDatabase() {
    const { id } = this.item;
    this.databaseStore.fetchList({ id });
  }

  get database() {
    return (this.databaseStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
      key: it.name,
    }));
  }

  get formItems() {
    return [
      {
        name: 'userName',
        label: t('Name'),
        type: 'input-name',
        required: true,
        isDatabaseUserName: true,
        maxLength: 16,
      },
      {
        name: 'database',
        label: t('Database'),
        type: 'select',
        options: this.database,
        mode: 'multiple',
        required: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword'),
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.create(id, {
      users: [
        {
          databases: values.database.map((it) => ({ name: it })),
          name: values.userName,
          password: values.password,
        },
      ],
    });
  };
}

export default inject('rootStore')(observer(UserCreate));
