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
import globalUserStore from 'stores/keystone/user';
import { phoneNumberValidate, emailValidate } from 'utils/validate';
import parsePhoneNumberFromString from 'libphonenumber-js';

export class EditForm extends ModalAction {
  init() {
    this.store = globalUserStore;
    const {
      list: { data },
    } = this.store;
    data.length === 0 && this.store.fetchList();
  }

  static id = 'user-edit';

  static title = t('Edit');

  static policy = 'identity:update_user';

  static allowed() {
    return Promise.resolve(true);
  }

  get actionName() {
    return t('Edit User');
  }

  get defaultValue() {
    const { name, email, phone, real_name, description, domain, domain_id } =
      this.item;
    const formattedPhone = parsePhoneNumberFromString(phone || '', 'CN') || {
      countryCallingCode: '86',
      nationalNumber: '',
    };
    const { countryCallingCode, nationalNumber } = formattedPhone;
    return {
      name,
      domainName: (domain || {}).name || domain_id,
      email,
      phone: `+${countryCallingCode} ${nationalNumber}`,
      real_name,
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
        t('Invalid: User names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
        placeholder: t('Please input user name'),
        validator: this.checkName,
        extra: t('User') + t('Name can not be duplicated'),
        required: true,
      },
      {
        name: 'email',
        label: t('Email'),
        type: 'input',
        validator: emailValidate,
        required: true,
      },
      {
        name: 'phone',
        label: t('Phone'),
        type: 'phone',
        required: true,
        validator: phoneNumberValidate,
      },
      {
        name: 'real_name',
        label: t('Real Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'domainName',
        label: t('Affiliated Domain'),
        type: 'input',
        disabled: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const { email, phone, real_name, description, name } = values;
    const { id } = this.item;
    return globalUserStore.edit(id, {
      email,
      phone,
      real_name,
      description,
      name,
    });
  };
}

export default inject('rootStore')(observer(EditForm));
