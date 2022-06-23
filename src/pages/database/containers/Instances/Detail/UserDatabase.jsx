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

export class UserDatabase extends ModalAction {
  init() {
    this.store = globalInstancesUsersStore;
    this.databaseStore = new InstancesDatabasesStore();
    this.fetchDatabase();
  }

  static id = 'grant-databases-access';

  static title = t('Grant Databases Access');

  get name() {
    return t('Grant Databases Access');
  }

  static policy = 'instance:extension:user_access:update';

  static allowed() {
    return Promise.resolve(true);
  }

  async fetchDatabase() {
    const { containerProps: { detail: { id } = {} } = {} } = this.props;
    await this.databaseStore.fetchList({ id });
    this.updateDefaultValue();
  }

  get database() {
    return (this.databaseStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
      key: it.name,
    }));
  }

  get defaultValue() {
    const { name, databases } = this.item;
    return {
      name,
      database: databases,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        disabled: true,
      },
      {
        name: 'database',
        label: t('Database'),
        type: 'select',
        options: this.database,
        mode: 'multiple',
        required: true,
        loading: this.databaseStore.list.isLoading,
        disabled: this.databaseStore.list.isLoading,
      },
    ];
  }

  onSubmit = (values, containerProps) => {
    const { detail: { id } = {} } = containerProps;
    const data = {
      databases: values.database.map((it) => ({ name: it })),
    };
    return this.store.grantDatabaseAccess({ id, name: values.name, data });
  };
}

export default inject('rootStore')(observer(UserDatabase));
