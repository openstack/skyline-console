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
import globalUserStore from 'stores/keystone/user';
import { has } from 'lodash';
import { ModalAction } from 'containers/Action';
import { Select } from 'antd';
import globalProjectStore from 'stores/keystone/project';
import globalRoleStore from 'stores/keystone/role';
import globalDomainStore from 'stores/keystone/domain';
import globalGroupStore from 'stores/keystone/user-group';

@inject('rootStore')
@observer
class CreateForm extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      domain: null,
      more: false,
      newProjectRoles: {},
    };
  }

  init() {
    this.userStore = globalUserStore;
    this.userGroupStore = globalGroupStore;
    this.projectStore = globalProjectStore;
    this.domainStore = globalDomainStore;
    this.roleStore = globalRoleStore;
    this.getUser();
    this.getProject();
    this.getDomains();
    this.getRole();
  }

  getUser() {
    this.userStore.fetchList();
  }

  getProject() {
    this.projectStore.fetchList();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  getRole() {
    this.roleStore.fetchList();
  }

  static id = 'user-group-create';

  static title = t('Create User Group');

  // static path = '/identity/user-group-admin/create';

  static policy = ['identity:create_group', 'identity:add_user_to_group'];

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create User Group');
  }

  get domainDefault() {
    const { domains } = this.domainStore;
    const domainDefault = domains.filter((it) => it.id === 'default');
    return domainDefault[0];
  }

  get defaultValue() {
    const data = {
      more: false,
    };
    return data;
  }

  get domainList() {
    const { domains } = this.domainStore;
    return (domains || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get userList() {
    return (this.userStore.list.data || []).map((it) => ({
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

  groupRolesList = (groupId) => {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
      groupId,
    }));
  };

  defaultRoles = () => {
    return [this.roleStore.list.data[0].id];
  };

  groupRoleChange = (value, option) => {
    const { newProjectRoles } = this.state;
    const { groupId } = option[0];
    newProjectRoles[groupId] = value;
    this.setState({ newProjectRoles });
  };

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'more')) {
      this.setState({
        more: changedFields.more,
      });
    }
  };

  get leftProjectTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  get rightProjectTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        title: t('Select Project Role'),
        dataIndex: 'id',
        render: (id) => {
          return (
            <Select
              size="small"
              options={this.groupRolesList(id)}
              defaultValue={this.defaultRoles()}
              onChange={this.groupRoleChange}
              mode="multiple"
            />
          );
        },
      },
    ];
  }

  get leftUserTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  get rightUserTable() {
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
    } = this.userGroupStore;
    const nameUsed = data.filter((it) => it.name === value);
    if (nameUsed[0]) {
      return Promise.reject(
        t('Invalid: User Group name can not be duplicated')
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
        maxLength: 30,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      // {
      //   type: 'divider',
      // },
      // {
      //   name: 'more',
      //   label: t('Advanced Options'),
      //   type: 'more',
      // },
      // {
      //   name: 'select_project',
      //   label: t('Select Project'),
      //   type: 'transfer',
      //   leftTableColumns: this.leftProjectTable,
      //   rightTableColumns: this.rightProjectTable,
      //   dataSource: domain ? this.projects.filter(it => it.domain_id === domain) : [],
      //   disabled: false,
      //   showSearch: true,
      //   hidden: !more || !domain,
      // },
      // {
      //   name: 'select_user',
      //   label: t('Select User'),
      //   type: 'transfer',
      //   leftTableColumns: this.leftUserTable,
      //   rightTableColumns: this.rightUserTable,
      //   dataSource: domain ? this.userList.filter(it => it.domain_id === domain) : [],
      //   disabled: false,
      //   showSearch: true,
      //   hidden: !more || !domain,
      // },
    ];
  }

  onSubmit = (values) => {
    const defaultRole = this.roleStore.list.data[0].id;
    values.domain_id = this.domainDefault.id;
    const { newProjectRoles } = this.state;
    return this.userGroupStore.create(values, newProjectRoles, defaultRole);
  };
}

export default CreateForm;
