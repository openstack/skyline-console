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
import globalDomainStore from 'stores/keystone/domain';
import { phoneNumberValidate, emailValidate } from 'utils/validate';
import parsePhoneNumberFromString from 'libphonenumber-js';

export class EditForm extends ModalAction {
  init() {
    this.store = globalUserStore;
    this.domainStore = globalDomainStore;
    this.getDomains();
    this.getProject();
  }

  componentDidMount() {
    const { item } = this.props;
    const { id } = this.item;
    this.store.fetchDetail({ ...item, id });
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  getProject() {
    this.store.fetchProject();
  }

  static id = 'user-edit';

  static title = t('Edit');

  // static path(item) {
  //   return `/identity/user-admin/edit/${item.id}`;
  // }

  static policy = 'identity:update_user';

  static allowed() {
    return Promise.resolve(true);
  }

  get domainList() {
    return (this.userGroupStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get projectList() {
    const { projects } = this.store;
    return (projects || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get data() {
    return this.store.detail || [];
  }

  get name() {
    const { name } = this.data;
    return `${t('edit')} ${name}`;
  }

  get defaultValue() {
    const {
      name,
      email,
      phone,
      real_name,
      description,
      domain_id,
      default_project_id,
    } = this.data;
    const { domains } = this.domainStore;
    const { projects } = this.store;
    const domain = domains.filter((it) => it.id === domain_id)[0];
    const project = projects.filter((it) => it.id === default_project_id)[0];
    if (name && this.formRef.current) {
      const formatedPhone = parsePhoneNumberFromString(phone || '', 'CN') || {
        country: 'CN',
        nationalNumber: '',
      };
      const { countryCallingCode, nationalNumber } = formatedPhone;
      this.formRef.current.setFieldsValue({
        name,
        domain_id: domain ? domain.name : '',
        default_project_id: project ? project.name : '',
        email,
        phone: `+${countryCallingCode} ${nationalNumber}`,
        real_name,
        description,
      });
    }
    return {};
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const {
      list: { data },
    } = this.store;
    const { name } = this.item;
    const nameUsed = data.filter((it) => it.name === value);
    if (nameUsed[0] && nameUsed[0].name !== name) {
      return Promise.reject(t('Invalid: User name can not be duplicated'));
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
        name: 'domain_id',
        label: t('Affiliated Domain'),
        type: 'input',
        required: true,
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
