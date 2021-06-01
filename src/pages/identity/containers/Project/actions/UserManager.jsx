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

@inject('rootStore')
@observer
export default class UserManager extends ModalAction {
  constructor(props) {
    super(props);
    const projectRole = JSON.stringify(this.item.userMapProjectRoles);
    this.state = {
      domainDefault: this.item.domain_id,
      userRoles: JSON.parse(projectRole),
      userList: [],
    };
  }

  // componentDidMount() {
  //   this.setState({ userRoles: this.defaultUserRoles });
  // }

  static id = 'management-user';

  static title = t('Manage User');

  get name() {
    return t('Manager user');
  }

  init() {
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
    }));
  }

  get checkedList() {
    const { domains } = this.domainStore;
    return (domains || []).map((it) => ({
      label: it.name,
      value: it.id,
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
      user_id,
    }));
  };

  userRolesList = (user_id) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      user_id,
    }));

  defaultRoles = (userId) => {
    const { roles } = this.item;
    const { userRoles: users } = this.state;
    if (!users[userId]) {
      roles[userId] = [this.projectRoleList[0].id];
    } else {
      const usersProjectRole = users[userId].filter((it) => {
        const projectRole = this.projectRoleList.find((role) => role.id === it);
        return !!projectRole;
      });
      return usersProjectRole;
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
        title: t('Select Projct Role'),
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
        options={disable ? this.adminRoleList(id) : this.userRolesList(id)}
        defaultValue={disable ? this.adminRoleId : this.defaultRoles(id)}
        onChange={this.onSubChange}
        disabled={disable}
      />
    );
  };

  onSubChange = (value, option) => {
    const { userRoles } = this.state;
    const { user_id } = option;
    userRoles[user_id] = [value];
    this.setState({ userRoles });
  };

  get defaultValue() {
    const { domain_id: domain } = this.item;
    const data = {
      domain_id: domain || 'default',
    };
    return data;
  }

  get formItems() {
    // const { users } = this.item;
    const { domainDefault, userRoles } = this.state;
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
        oriTargetKeys: userRoles ? Object.keys(userRoles) : [],
      },
    ];
  }

  onSubmit = async (values) => {
    const { userRoles } = this.state;
    const { id } = this.item;
    const oldUserRoles = this.item.userMapProjectRoles;
    const defaultUsers = Object.keys(oldUserRoles);
    const promiseList = [];
    defaultUsers.forEach((user_id) => {
      if (values.select_user.indexOf(user_id) === -1) {
        (oldUserRoles[user_id] || []).forEach((role_id) => {
          promiseList.push(
            globalProjectStore.removeUserRole({ id, user_id, role_id })
          );
        });
      } else {
        (oldUserRoles[user_id] || []).forEach((role_id) => {
          if (userRoles[user_id].indexOf(role_id) === -1) {
            promiseList.push(
              globalProjectStore.removeUserRole({ id, user_id, role_id })
            );
          }
        });
      }
    });
    values.select_user.forEach((user_id) => {
      if (defaultUsers.indexOf(user_id) === -1) {
        const role_id =
          (userRoles[user_id] || [])[0] || this.projectRoleList[0].id;
        promiseList.push(
          globalProjectStore.assignUserRole({ id, user_id, role_id })
        );
      } else {
        const role_id = userRoles[user_id][0];
        if (
          (oldUserRoles[user_id] && oldUserRoles[user_id][0] !== role_id) ||
          !oldUserRoles[user_id]
        ) {
          promiseList.push(
            globalProjectStore.assignUserRole({ id, user_id, role_id })
          );
        }
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}
