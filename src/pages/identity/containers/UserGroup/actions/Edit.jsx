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
import globalGroupStore from 'stores/keystone/user-group';

export class EditForm extends ModalAction {
  init() {
    this.store = globalGroupStore;
  }

  static id = 'user-group-edit';

  static title = t('Edit');

  static policy = 'identity:update_group';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { name, description } = this.item;
    return {
      name,
      description,
    };
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const {
      list: { data },
    } = this.store;
    const { id } = this.item;
    const nameUsed = data.find(
      (it) =>
        it.name === value &&
        it.id !== id &&
        it.domain_id === this.item.domain_id
    );
    if (nameUsed) {
      return Promise.reject(
        t('Invalid: User Group names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Group Name'),
        type: 'input',
        placeholder: t('Please input name'),
        required: true,
        validator: this.checkName,
        extra: t('User Groups') + t('Name can not be duplicated'),
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
    return globalGroupStore.edit({ id, description, name });
  };
}

export default inject('rootStore')(observer(EditForm));
