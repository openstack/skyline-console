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
import globalRoleStore from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';

export class Create extends ModalAction {
  init() {
    this.store = globalRoleStore;
  }

  static id = 'role-create';

  static title = t('Create Role');

  static policy = 'identity:create_role';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Role');
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.create(values);
  };
}

export default inject('rootStore')(observer(Create));
