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
  projectDomainColumns,
  transferFilterOption,
  groupDomainColumns,
} from 'resources/keystone/domain';
import { roleFilterOption } from 'resources/keystone/role';

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
    return projectDomainColumns;
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
      projectRoles[projectId] = [];
    }
    this.setState({ projectRoles });
  };

  onClickSelect = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  renderSelect = (projectId) => {
    return (
      <Select
        size="small"
        mode="multiple"
        options={this.projectRolesList(projectId)}
        defaultValue={this.defaultRoles()}
        filterOption={roleFilterOption}
        onChange={(value, option) => {
          this.onSelectChange(value, option, projectId);
        }}
        onClick={this.onClickSelect}
      />
    );
  };

  get rightProjectTable() {
    return [
      ...projectDomainColumns,
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
    return groupDomainColumns;
  }

  get rightUserGroupTable() {
    return groupDomainColumns;
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const domainId = this.formRef.current.getFieldValue('domain_id');
    if (!domainId) {
      return Promise.resolve();
    }
    const {
      list: { data },
    } = this.store;
    const nameUsed = data.filter(
      (it) => it.name === value && it.domain_id === domainId
    );
    if (nameUsed[0]) {
      return Promise.reject(
        t('Invalid: User names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const { more } = this.state;
    const labelCol = {
      xs: { span: 4 },
      sm: { span: 5 },
    };
    const wrapperCol = {
      xs: { span: 16 },
      sm: { span: 15 },
    };
    const cols = {
      labelCol,
      wrapperCol,
      colNum: 2,
    };
    const domainFormItem = getDomainFormItem(this);
    const currentDomainFormItem = {
      ...domainFormItem,
      ...cols,
    };
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
        validator: this.checkName,
        extra: t('User name can not be duplicated'),
        required: true,
        ...cols,
        maxLength: 30,
        dependencies: ['domain_id'],
      },
      {
        name: 'email',
        label: t('Email'),
        type: 'input',
        required: true,
        validator: emailValidate,
        ...cols,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password'),
        ...cols,
      },
      {
        name: 'phone',
        label: t('Phone'),
        type: 'phone',
        required: true,
        validator: phoneNumberValidate,
        ...cols,
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword'),
        ...cols,
      },
      currentDomainFormItem,
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
        ...cols,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        ...cols,
      },
      {
        name: 'real_name',
        label: t('Real Name'),
        type: 'input',
        required: true,
        ...cols,
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
        loading: this.projectStore.list.isLoading,
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
        loading: this.userGroupStore.list.isLoading,
      },
    ];
  }

  onSubmit = async (values) => {
    const { projectRoles } = this.state;
    values.defaultRole = this.projectRoleList[0].id;
    values.projectRoles = projectRoles;
    const { confirmPassword, more, ...rest } = values;
    return this.store.create(rest);
  };
}

export default inject('rootStore')(observer(Create));
