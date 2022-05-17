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
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { getPasswordOtherRule } from 'utils/validate';
import {
  isNotLockedOrAdmin,
  checkStatus,
  isIronicInstance,
} from 'resources/nova/instance';

export class ChangePassword extends ModalAction {
  static id = 'change-password';

  static title = t('Change Password');

  init() {
    this.store = globalServerStore;
  }

  get name() {
    return t('Change password');
  }

  get tips() {
    return t(
      'If OS is Linux, system will reset root password, if OS is Windows, system will reset Administrator password.'
    );
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      snapshot: '',
      ipType: 0,
    };
    return value;
  }

  static policy = 'os_compute_api:os-admin-password';

  static isActive = (item) => checkStatus(['active'], item);

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      this.isActive(item) &&
        isNotLockedOrAdmin(item, isAdminPage) &&
        !isIronicInstance(item)
    );
  };

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password', 'instance'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        dependencies: ['password'],
        required: true,
        otherRule: getPasswordOtherRule('confirmPassword', 'instance'),
      },
    ];
  }

  onSubmit = (values) => {
    const { password } = values;
    const { id } = this.item;
    return this.store.changePassword({ id, password });
  };
}

export default inject('rootStore')(observer(ChangePassword));
