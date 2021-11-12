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

import React from 'react';
import { has } from 'lodash';
import { inject, observer } from 'mobx-react';
import globalGroupStore from 'stores/keystone/user-group';
import globalUserStore from 'stores/keystone/user';
import { FormAction } from 'containers/Action';
import { Select } from 'antd';
import globalProjectStore from 'stores/keystone/project';
import globalRoleStore from 'stores/keystone/role';
import {
  getPasswordOtherRule,
  phoneNumberValidate,
  emailValidate,
} from 'utils/validate';
import { statusTypes } from 'utils/constants';

export class CreateForm extends FormAction {
  constructor(props) {
    super(props);

    this.state = {
      domain: 'default',
      more: false,
      newProjectRoles: {},
    };
  }

  init() {
    this.store = globalUserStore;
    this.userGroupStore = globalGroupStore;
    this.projectStore = globalProjectStore;
    this.roleStore = globalRoleStore;
    this.getUserGroup();
    this.getProject();
    this.getRole();
    this.getDomains();
  }

  getDomains() {
    this.store.fetchDomain();
  }

  getUserGroup() {
    this.userGroupStore.fetchList();
  }

  getProject() {
    this.projectStore.fetchList();
  }

  getRole() {
    this.roleStore.fetchList();
  }

  static id = 'user-create';

  static title = t('Create User');

  static path = '/identity/user-admin/create';

  static policy = [
    'identity:create_user',
    'identity:update_user',
    'identity:list_roles',
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

  get name() {
    return t('Create User');
  }

  get listUrl() {
    return this.getRoutePath('user');
  }

  get defaultValue() {
    const { domains } = this.store;
    const { domain } = this.state;
    const domianDefault = (domains || []).filter((it) => it.id === domain)[0];
    const data = {
      more: false,
      enabled: statusTypes[0].value,
      domain_id: domianDefault ? domianDefault.name : 'Default',
    };
    return data;
  }

  get projectList() {
    return (this.projectStore.list.data || []).map((it) => ({
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

  // get roleList() {
  //   return (this.roleStore.list.data || []).map(it => ({
  //     label: it.name,
  //     value: it.id,
  //   }));
  // }

  // get adminRole() {
  //   return (this.roleStore.list.data || []).filter(it =>
  //     it.name === 'admin'
  //   )[0];
  // }

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'more')) {
      this.setState({
        more: changedFields.more,
      });
    }
  };

  static allowed = () => Promise.resolve(true);

  get leftProjectTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  get projectRoleList() {
    const projectRole = this.roleStore.list.data || [];
    return projectRole;
  }

  userRolesList = (role_id) =>
    (this.projectRoleList || []).map((it) => ({
      label: it.name,
      value: it.id,
      role_id,
    }));

  defaultRoles = () => [this.projectRoleList[0].id];

  userRoleChange = (value, option) => {
    const { newProjectRoles } = this.state;
    const { role_id } = option;
    newProjectRoles[role_id] = value;
    this.setState({ newProjectRoles });
  };

  get rightProjectTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        title: t('Select Projct Role'),
        dataIndex: 'id',
        render: (id) => (
          <Select
            size="small"
            options={this.userRolesList(id)}
            defaultValue={this.defaultRoles()}
            onChange={this.userRoleChange}
          />
        ),
      },
    ];
  }

  get leftUserGroupTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  get rightUserGroupTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const {
      list: { data },
    } = this.store;
    const nameUsed = data.filter((it) => it.name === value);
    if (nameUsed[0]) {
      return Promise.reject(t('Invalid: User name can not be duplicated'));
    }
    return Promise.resolve();
  };

  get formItems() {
    const { more, domain } = this.state;
    const labelCol = {
      xs: { span: 5 },
      sm: { span: 6 },
    };
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
        placeholder: t('Please input user name'),
        validator: this.checkName,
        extra: t('User name can not be duplicated'),
        required: true,
        labelCol,
        colNum: 2,
        maxLength: 30,
      },
      {
        name: 'email',
        label: t('Email'),
        type: 'input',
        required: true,
        validator: emailValidate,
        labelCol,
        colNum: 2,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password'),
        labelCol,
        colNum: 2,
      },
      {
        name: 'phone',
        label: t('Phone'),
        type: 'phone',
        required: true,
        validator: phoneNumberValidate,
        labelCol,
        colNum: 2,
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword'),
        labelCol,
        colNum: 2,
      },
      {
        name: 'domain_id',
        label: t('Affiliated Domain'),
        type: 'input',
        // options: this.domainList,
        // onChange: (e) => {
        //   this.setState({
        //     domain: e,
        //   });
        // },
        disabled: true,
        colNum: 2,
        labelCol,
      },
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
        labelCol,
        colNum: 2,
      },
      // {
      //   name: 'default_project_id',
      //   label: t('Main Project'),
      //   type: 'select',
      //   options: this.projectList,
      //   labelCol,
      //   colNum: 2,
      // },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        labelCol,
        colNum: 2,
      },
      {
        name: 'real_name',
        label: t('Real Name'),
        type: 'input',
        required: true,
        labelCol,
        colNum: 2,
        maxLength: 30,
      },
      // {
      //   name: 'work num',
      //   label: t('Work Num'),
      //   type: 'input',
      //   labelCol,
      //   colNum: 2,
      // },
      {
        type: 'divider',
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
      {
        name: 'select_project',
        label: t('Select Project'),
        type: 'transfer',
        leftTableColumns: this.leftProjectTable,
        rightTableColumns: this.rightProjectTable,
        dataSource: domain
          ? this.projects.filter((it) => it.domain_id === domain)
          : [],
        disabled: false,
        showSearch: true,
        hidden: !more || !domain,
      },
      {
        name: 'select_user_group',
        label: t('Select User Group'),
        type: 'transfer',
        leftTableColumns: this.leftUserGroupTable,
        rightTableColumns: this.rightUserGroupTable,
        dataSource: domain
          ? this.userGroupList.filter((it) => it.domain_id === domain)
          : [],
        disabled: false,
        showSearch: true,
        hidden: !more || !domain,
      },
    ];
  }

  onSubmit = async (values) => {
    const { domain } = this.state;
    values.defaultRole = this.projectRoleList[0].id;
    values.newProjectRoles = this.state.newProjectRoles;
    values.domain_id = domain;
    const { confirmPassword, ...rest } = values;
    return this.store.create(rest);
  };
}

export default inject('rootStore')(observer(CreateForm));
