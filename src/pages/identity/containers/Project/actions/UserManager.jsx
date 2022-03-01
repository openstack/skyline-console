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
import globalRoleStore from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';
import globalDomainStore from 'stores/keystone/domain';

export class UserManager extends ModalAction {
  static id = 'management-user';

  static title = t('Manage User');

  get name() {
    return t('Manager user');
  }

  init() {
    const projectRole = JSON.stringify(this.item.userMapProjectRoles);
    this.state.domainDefault = this.item.domain_id;
    this.state.userRoles = JSON.parse(projectRole);
    this.store = globalRoleStore;
    this.domainStore = globalDomainStore;
    this.userStore = new UserStore();
    this.getRoleList();
    this.getDomains();
    this.getUser();
  }

  getRoleList() {
    this.store.fetchList();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  getUser() {
    this.userStore.fetchList();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get multipleMode() {
    return 'multiple';
  }

  // get defaultUserRoles() {
  //   const { users } = this.item;
  //   const defaultUsers = Object.keys(users);
  //   const projectRole = (this.store.list.data || []).filter(it =>
  //     ((it.name.indexOf('project_') !== -1) && (it.name.indexOf('_project_') === -1)) ||
  //     it.name === 'admin'
  //   );
  //   const projectRoleId = projectRole.map(it => it.id);
  //   const defaultUserRoles = {};
  //   defaultUsers.forEach((user_id) => {
  //     const roles = users[user_id].filter(role_id => projectRoleId.indexOf(role_id) !== -1);
  //     if (roles[0]) {
  //       defaultUserRoles[user_id] = roles;
  //     }
  //   });
  //   return defaultUserRoles;
  // }

  get domainList() {
    const {
      rootStore: { baseDomains },
    } = this.props;
    const { domains } = this.domainStore;
    const domainList = (domains || []).filter(
      (it) =>
        baseDomains.indexOf(it.name) === -1 || it.id === this.item.domain_id
    );
    return domainList.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
    }));
  }

  get checkedList() {
    const { domains } = this.domainStore;
    return (domains || []).map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
    }));
  }

  get item() {
    const { item } = this.props;
    item.roles = {};
    return item;
  }

  get userList() {
    return (this.userStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get projectRoleList() {
    const projectRole = this.store.list.data || [];
    return projectRole;
  }

  get adminRoleId() {
    const adminRole = (this.store.list.data || []).filter(
      (it) => it.name === 'admin'
    );
    return adminRole[0].id;
  }

  adminRoleList = (user_id) => {
    const adminRole = (this.store.list.data || []).filter(
      (it) => it.name === 'admin'
    );
    return adminRole.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
      user_id,
    }));
  };

  userRolesList = (user_id) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
      user_id,
    }));

  defaultRoles = (userId) => {
    const { roles, users } = this.item;
    const { userRoles: projectUsers } = this.state;
    const filterUsers = this.multipleMode ? users : projectUsers;
    if (!filterUsers[userId]) {
      roles[userId] = [this.projectRoleList[0].id];
    } else {
      const usersProjectRole = filterUsers[userId].filter((it) => {
        const projectRole = this.projectRoleList.find((role) => role.id === it);
        return !!projectRole;
      });
      return this.multipleMode
        ? usersProjectRole
        : usersProjectRole.slice(0, 1);
    }
    return roles[userId];
  };

  static policy = 'identity:update_project';

  static allowed = () => Promise.resolve(true);

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
      {
        title: t('Select Project Role'),
        dataIndex: 'id',
        render: (id) => this.renderSelect(id),
      },
    ];
  }

  renderSelect = (id) => {
    let disable = false;
    if (this.item.users && this.item.users[id]) {
      // eslint-disable-next-line prefer-destructuring
      disable = this.item.users[id].filter((it) => it === this.adminRoleId)[0];
    }
    return (
      <Select
        size="small"
        mode={this.multipleMode}
        options={disable ? this.adminRoleList(id) : this.userRolesList(id)}
        defaultValue={disable ? this.adminRoleId : this.defaultRoles(id)}
        onChange={this.onSubChange}
        disabled={disable}
      />
    );
  };

  onSubChange = (value, option) => {
    if (
      (this.multipleMode && value.length && option.length) ||
      (!this.multipleMode && value && option)
    ) {
      const { userRoles } = this.state;
      const { user_id } = this.multipleMode ? option[0] : option;
      userRoles[user_id] = this.multipleMode ? value : [value];
      this.setState({ userRoles });
    } else {
      this.setState({ userRoles: {} });
    }
  };

  get defaultValue() {
    const { domain_id: domain } = this.item;
    const data = {
      domain_id: domain || 'default',
    };
    return data;
  }

  get formItems() {
    const { users } = this.item;
    const { domainDefault } = this.state;
    return [
      {
        name: 'domain_id',
        label: t('Affiliated Domain'),
        type: 'select',
        checkOptions: this.checkedList,
        checkBoxInfo: t('Show All Domain'),
        options: this.domainList,
        onChange: (e) => {
          this.setState({
            domainDefault: e,
          });
        },
        required: true,
      },
      {
        name: 'select_user',
        type: 'transfer',
        label: t('User'),
        leftTableColumns: this.leftUserTable,
        rightTableColumns: this.rightUserTable,
        dataSource: this.userList
          ? this.userList.filter((it) => it.domain_id === domainDefault)
          : [],
        disabled: false,
        showSearch: true,
        oriTargetKeys: users ? Object.keys(users) : [],
      },
    ];
  }

  onSubmit = async (values) => {
    const { userRoles } = this.state;
    if (!this.multipleMode) {
      // If it is not multiple choices, role only takes the first item of the array
      Object.keys(userRoles).forEach((key) => {
        userRoles[key] = userRoles[key].slice(0, 1);
      });
    }
    const { id, users } = this.item;
    const oldUserRoles = users;
    const defaultUsers = Object.keys(oldUserRoles);
    const promiseList = [];
    defaultUsers.forEach((user_id) => {
      if (!values.select_user.includes(user_id)) {
        (oldUserRoles[user_id] || []).forEach((role_id) => {
          promiseList.push(
            globalProjectStore.removeUserRole({ id, user_id, role_id })
          );
        });
      } else {
        (oldUserRoles[user_id] || []).forEach((role_id) => {
          if (!userRoles[user_id].includes(role_id)) {
            promiseList.push(
              globalProjectStore.removeUserRole({ id, user_id, role_id })
            );
          }
        });
      }
    });
    values.select_user.forEach((user_id) => {
      if (!defaultUsers.includes(user_id)) {
        if (userRoles[user_id]) {
          userRoles[user_id].forEach((role_id) => {
            promiseList.push(
              globalProjectStore.assignUserRole({ id, user_id, role_id })
            );
          });
        } else {
          promiseList.push(
            globalProjectStore.assignUserRole({
              id,
              user_id,
              role_id: this.projectRoleList[0].id,
            })
          );
        }
      } else {
        (userRoles[user_id] || []).forEach((role_id) => {
          if (
            (oldUserRoles[user_id] &&
              !oldUserRoles[user_id].includes(role_id)) ||
            !oldUserRoles[user_id]
          ) {
            promiseList.push(
              globalProjectStore.assignUserRole({ id, user_id, role_id })
            );
          }
        });
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(UserManager));
