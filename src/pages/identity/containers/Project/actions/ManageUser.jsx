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
import { Select } from 'antd';
import globalProjectStore from 'stores/keystone/project';
import { UserStore } from 'stores/keystone/user';
import { RoleStore } from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';
import {
  userDomainColumns,
  transferFilterOption,
} from 'resources/keystone/domain';
import { roleFilterOption } from 'resources/keystone/role';

export class ManageUser extends ModalAction {
  static id = 'management-user';

  static title = t('Manage User');

  get name() {
    return t('Manage user');
  }

  async init() {
    this.state.userRoles = this.getInitRoleMap();
    this.store = new RoleStore();
    this.userStore = new UserStore();
    this.getRoleList();
    this.getUser();
  }

  getRoleList() {
    return this.store.fetchList();
  }

  getUser() {
    this.userStore.fetchList({ withProjectRole: false, withSystemRole: false });
  }

  getInitRoleMap() {
    const { users = {} } = this.item;
    return Object.keys(users).reduce((pre, cur) => {
      pre[cur] = users[cur].map((it) => it.id);
      return pre;
    }, {});
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get labelCol() {
    return {
      xs: { span: 4 },
      sm: { span: 2 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 20 },
      sm: { span: 20 },
    };
  }

  get userList() {
    const users = this.userStore.list.data || [];
    return users.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get projectRoleList() {
    return this.store.list.data || [];
  }

  userRolesList = (user_id) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
      user_id,
    }));

  defaultRoles = (userId) => {
    const { users } = this.item;
    if (!users[userId]) {
      return [this.projectRoleList[0].id];
    }
    const usersProjectRole = users[userId].map((it) => {
      return it.id;
    });
    return usersProjectRole;
  };

  static policy = ['identity:create_grant', 'identity:revoke_grant'];

  static allowed = () => Promise.resolve(true);

  get leftUserTable() {
    return userDomainColumns;
  }

  get rightUserTable() {
    return [
      ...userDomainColumns,
      {
        title: t('Select Project Role'),
        dataIndex: 'id',
        render: (id) => this.renderSelect(id),
      },
    ];
  }

  onClickSelect = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  renderSelect = (id) => {
    return (
      <Select
        size="small"
        mode="multiple"
        options={this.userRolesList(id)}
        defaultValue={this.defaultRoles(id)}
        filterOption={roleFilterOption}
        onChange={(value, option) => {
          this.onSelectChange(value, option, id);
        }}
        onClick={this.onClickSelect}
      />
    );
  };

  onSelectChange = (value, option, userId) => {
    const { userRoles } = this.state;
    if (value.length && option.length) {
      userRoles[userId] = value;
    } else {
      userRoles[userId] = [];
    }
    this.setState({ userRoles });
  };

  get defaultValue() {
    const { name, domainName } = this.item;
    const data = {
      name,
      domain: domainName,
    };
    return data;
  }

  onChangeUser = (value) => {
    const { userRoles } = this.state;
    (value || []).forEach((userId) => {
      if (!userRoles[userId]) {
        userRoles[userId] = this.defaultRoles(userId);
      }
    });
    Object.keys(userRoles).forEach((userId) => {
      if (!(value || []).includes(userId)) {
        delete userRoles[userId];
      }
    });
    this.setState(userRoles);
  };

  get formItems() {
    const { users } = this.item;
    return [
      {
        name: 'name',
        type: 'label',
        label: t('Name'),
        iconType: 'project',
      },
      {
        name: 'domain',
        type: 'label',
        label: t('Domain'),
      },
      {
        name: 'select_user',
        type: 'transfer',
        label: t('User'),
        leftTableColumns: this.leftUserTable,
        rightTableColumns: this.rightUserTable,
        dataSource: this.userList,
        showSearch: true,
        oriTargetKeys: users ? Object.keys(users) : [],
        onChange: this.onChangeUser,
        filterOption: transferFilterOption,
        wrapperCol: this.wrapperCol,
        loading: this.userStore.list.isLoading,
      },
    ];
  }

  onSubmit = async () => {
    const { userRoles } = this.state;
    const { id } = this.item;
    const oldUserRoles = this.getInitRoleMap();
    const promiseList = [];
    Object.keys(oldUserRoles).forEach((userId) => {
      (oldUserRoles[userId] || []).forEach((roleId) => {
        const newRoles = userRoles[userId] || [];
        if (!newRoles.includes(roleId)) {
          promiseList.push(
            globalProjectStore.removeUserRole({ id, userId, roleId })
          );
        }
      });
    });
    Object.keys(userRoles).forEach((userId) => {
      const oldRoles = oldUserRoles[userId] || [];
      userRoles[userId].forEach((roleId) => {
        if (!oldRoles.includes(roleId)) {
          promiseList.push(
            globalProjectStore.assignUserRole({ id, userId, roleId })
          );
        }
      });
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(ManageUser));
