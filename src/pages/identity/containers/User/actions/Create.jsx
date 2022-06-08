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
import { inject, observer } from 'mobx-react';
import { GroupStore } from 'stores/keystone/user-group';
import globalUserStore from 'stores/keystone/user';
import { FormAction } from 'containers/Action';
import { Select } from 'antd';
import { ProjectStore } from 'stores/keystone/project';
import globalRoleStore from 'stores/keystone/role';
import globalDomainStore from 'stores/keystone/domain';
import {
  getPasswordOtherRule,
  phoneNumberValidate,
  emailValidate,
} from 'utils/validate';
import {
  statusTypes,
  getDomainFormItem,
  nameDomainColumns,
  transferFilterOption,
} from 'resources/keystone/domain';

export class Create extends FormAction {
  constructor(props) {
    super(props);

    this.state = {
      domain: 'default',
      more: false,
      projectRoles: {},
    };
  }

  init() {
    this.store = globalUserStore;
    this.userGroupStore = new GroupStore();
    this.projectStore = new ProjectStore();
    this.roleStore = globalRoleStore;
    this.getUserGroups();
    this.getProjects();
    this.getRoles();
    this.getDomains();
  }

  getDomains() {
    globalDomainStore.fetchDomain();
  }

  getUserGroups() {
    this.userGroupStore.fetchList({ withRole: false });
  }

  getProjects() {
    this.projectStore.fetchList({ withRole: false });
  }

  getRoles() {
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
    const data = {
      more: false,
      enabled: statusTypes[0].value,
      domain_id: 'default',
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

  static allowed = () => Promise.resolve(true);

  get leftProjectTable() {
    return nameDomainColumns;
  }

  get projectRoleList() {
    return this.roleStore.list.data || [];
  }

  projectRolesList = (projectId) =>
    (this.projectRoleList || []).map((it) => ({
      label: it.name,
      value: it.id,
      projectId,
    }));

  defaultRoles = () => [(this.projectRoleList[0] || {}).id];

  onSelectChange = (value, option, projectId) => {
    const { projectRoles } = this.state;
    if (value.length && option.length) {
      projectRoles[projectId] = value;
    } else {
      projectRoles[projectId] = {};
    }
    this.setState({ projectRoles });
  };

  renderSelect = (projectId) => {
    return (
      <Select
        size="small"
        mode="multiple"
        options={this.projectRolesList(projectId)}
        defaultValue={this.defaultRoles()}
        onChange={(value, option) => {
          this.onSelectChange(value, option, projectId);
        }}
      />
    );
  };

  get rightProjectTable() {
    return [
      ...nameDomainColumns,
      {
        title: t('Select Project Role'),
        dataIndex: 'id',
        render: (id) => this.renderSelect(id),
      },
    ];
  }

  onChangeProject = (value) => {
    const { projectRoles } = this.state;
    (value || []).forEach((projectId) => {
      if (!projectRoles[projectId]) {
        projectRoles[projectId] = this.defaultRoles();
      }
    });
    Object.keys(projectRoles).forEach((projectId) => {
      if (!(value || []).includes(projectId)) {
        delete projectRoles[projectId];
      }
    });
    this.setState(projectRoles);
  };

  get leftUserGroupTable() {
    return nameDomainColumns;
  }

  get rightUserGroupTable() {
    return nameDomainColumns;
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
    const { more } = this.state;
    const labelCol = {
      xs: { span: 5 },
      sm: { span: 6 },
    };
    const domainFormItem = getDomainFormItem(this);
    const currentDomainFormItem = {
      ...domainFormItem,
      labelCol,
      colNum: 2,
    };
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
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
      currentDomainFormItem,
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
        dataSource: this.projects,
        showSearch: true,
        hidden: !more,
        onChange: this.onChangeProject,
        filterOption: transferFilterOption,
      },
      {
        name: 'select_user_group',
        label: t('Select User Group'),
        type: 'transfer',
        leftTableColumns: this.leftUserGroupTable,
        rightTableColumns: this.rightUserGroupTable,
        dataSource: this.userGroupList,
        showSearch: true,
        hidden: !more,
        filterOption: transferFilterOption,
      },
    ];
  }

  onSubmit = async (values) => {
    const { domain } = this.state;
    values.defaultRole = this.projectRoleList[0].id;
    values.projectRoles = this.state.projectRoles;
    values.domain_id = domain;
    const { confirmPassword, more, ...rest } = values;
    return this.store.create(rest);
  };
}

export default inject('rootStore')(observer(Create));
