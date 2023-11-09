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
import { ModalAction } from 'containers/Action';
import globalProjectStore from 'stores/keystone/project';

export class EditForm extends ModalAction {
  init() {
    this.store = globalProjectStore;
    this.store.fetchList();
  }

  static id = 'project-edit';

  static title = t('Edit');

  static policy = 'identity:update_project';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    const { name } = this.item;
    return `${t('Edit')} ${name}`;
  }

  get defaultValue() {
    const { name, description, enabled } = this.item;
    return {
      name,
      description,
      enabled,
    };
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const {
      list: { data },
    } = this.store;
    const nameUsed = data.find(
      (i) =>
        i.name === value &&
        i.id !== this.item.id &&
        i.domain_id === this.item.domain_id
    );
    if (nameUsed) {
      return Promise.reject(
        t('Invalid: Project names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        value: this.item.name,
        validator: this.checkName,
        extra: t('Project') + t('Name can not be duplicated'),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const { description, name } = values;
    const { id } = this.item;
    return globalProjectStore.edit({ id, description, name });
  };
}

export default inject('rootStore')(observer(EditForm));
