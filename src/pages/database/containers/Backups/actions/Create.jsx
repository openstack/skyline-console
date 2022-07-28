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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import globalInstancesStore from 'stores/trove/instances';
import globalBackupsStore from 'stores/trove/backups';

export class Create extends ModalAction {
  init() {
    this.store = globalBackupsStore;
    this.getDatabaseInstance();
  }

  static id = 'create-database-backup';

  static title = t('Create Database Backup');

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Database Backup');
  }

  static policy = 'backup:create';

  static aliasPolicy = 'trove:backup:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get listInstanceName() {
    return (globalInstancesStore.list.data || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  async getDatabaseInstance() {
    await globalInstancesStore.fetchListWithoutDetail();
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'instance',
        label: t('Database Instance'),
        type: 'select',
        options: this.listInstanceName,
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'input',
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.create({
      backup: {
        description: values.description,
        instance: values.instance,
        name: values.name,
      },
    });
  };
}

export default inject('rootStore')(observer(Create));
