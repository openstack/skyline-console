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
import { getPasswordOtherRule } from 'utils/validate';
import globalUserStore from 'stores/keystone/user';

export class Password extends ModalAction {
  static id = 'update-user-password';

  static title = t('Update User Password');

  get name() {
    return t('Update user password');
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      name,
      password: '',
      confirmPassword: '',
    };
    return value;
  }

  static policy = [];

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User'),
        type: 'label',
        iconType: 'user',
      },
      {
        name: 'oldPassword',
        label: t('Original Password'),
        type: 'input-password',
        required: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password', 'user'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        dependencies: ['password'],
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('confirmPassword', 'user'),
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { password, oldPassword: original_password } = values;
    return globalUserStore.changePasswordUser({
      id,
      password,
      original_password,
    });
  };
}

export default inject('rootStore')(observer(Password));
