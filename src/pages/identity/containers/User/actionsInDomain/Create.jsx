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
import globalGroupStore from 'stores/keystone/user-group';
import globalUserStore from 'stores/keystone/user';
import { ModalAction } from 'containers/Action';
import globalProjectStore from 'stores/keystone/project';
import globalRoleStore from 'stores/keystone/role';
import { getPasswordOtherRule } from 'utils/validate';
import globalDomainStore from 'stores/keystone/domain';
import { statusTypes } from 'utils/constants';

export class CreateForm extends ModalAction {
  init() {
    this.store = globalUserStore;
    this.userGroupStore = globalGroupStore;
    this.projectStore = globalProjectStore;
    this.roleStore = globalRoleStore;
    this.domainStore = globalDomainStore;
    this.getUserGroup();
    this.getProject();
    this.getRole();
    // this.getDomains();
  }

  get name() {
    return t('Create User');
  }

  getUserGroup() {
    this.userGroupStore.fetchList();
  }

  getProject() {
    this.store.fetchProject();
  }

  getRole() {
    this.roleStore.fetchList();
  }

  static id = 'user-create';

  static title = t('Create User');

  static policy = [
    'identity:create_user',
    'identity:update_user',
    'identity:list_roles',
    'identity:list_projects',
    'identity:list_domains',
  ];

  static allowed(item, containerProps) {
    const {
      match: { path },
    } = containerProps;
    if (path.indexOf('domain-admin/detail') >= 0) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { name } = this.item;
    const data = {
      domain_name: name,
      password: '',
      confirmPassword: '',
      enabled: statusTypes[0].value,
    };
    return data;
  }

  get nameForStateUpdate() {
    return ['password', 'confirmPassword'];
  }

  get domainList() {
    const { domains } = this.store;
    return (domains || []).map((it) => ({
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

  get userGroupList() {
    return (this.userGroupStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get projects() {
    return (this.projectStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get roleList() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  static allowed = () => Promise.resolve(true);

  get formItems() {
    // const { more } = this.state;
    // const labelCol = {
    //   xs: { span: 5 },
    //   sm: { span: 6 },
    // };
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
        placeholder: t('Please input user name'),
        required: true,
      },
      {
        name: 'email',
        label: t('Email'),
        type: 'input',
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
        dependencies: ['password'],
        required: true,
        otherRule: getPasswordOtherRule('confirmPassword'),
      },
      {
        name: 'phone',
        label: t('Phone'),
        type: 'input',
        required: true,
      },
      {
        name: 'domain_name',
        label: t('Affiliated Domain'),
        type: 'input',
        disabled: true,
        help: t('The affiliated Domain cannot be modified after creation'),
      },
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
      },
      // {
      //   name: 'default_project_id',
      //   label: t('Main Project'),
      //   type: 'select',
      //   options: this.projectList,
      // },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'real_name',
        label: t('Real Name'),
        type: 'input',
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      name,
      email,
      password,
      phone,
      enabled,
      default_project_id,
      description,
      real_name,
    } = values;
    const { id: domain_id } = this.item;
    const data = {
      name,
      email,
      password,
      phone,
      domain_id,
      enabled,
      description,
      real_name,
      default_project_id,
    };
    // eslint-disable-next-line no-console
    console.log(data);
    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(CreateForm));
