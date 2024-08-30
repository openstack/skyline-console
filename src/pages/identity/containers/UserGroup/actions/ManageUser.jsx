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
import { UserStore } from 'stores/keystone/user';
import { GroupStore } from 'stores/keystone/user-group';
import { ModalAction } from 'containers/Action';
import {
  userDomainColumns,
  transferFilterOption,
} from 'resources/keystone/domain';

export class ManageUser extends ModalAction {
  static id = 'manage-user';

  static title = t('Manage User');

  get name() {
    return t('Manage user');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  async init() {
    this.state.groupUsers = [];
    this.store = new GroupStore();
    this.userStore = new UserStore();
    this.getGroupUsers();
    this.getAllUser();
  }

  getAllUser() {
    this.userStore.fetchList({ withProjectRole: false, withSystemRole: false });
  }

  async getGroupUsers() {
    await this.store.fetchGroupUsers(this.item);
    this.setState({
      groupUsers: this.groupUsers,
    });
    this.updateDefaultValue();
  }

  get userList() {
    const users = this.userStore.list.data || [];
    return users.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get groupUsers() {
    return (this.store.groupUsers || []).map((it) => it.id);
  }

  static policy = [
    'identity:list_users_in_group',
    'identity:list_users_in_group',
    'identity:add_user_to_group',
  ];

  static allowed = () => Promise.resolve(true);

  get leftUserTable() {
    return userDomainColumns;
  }

  get rightUserTable() {
    return userDomainColumns;
  }

  get defaultValue() {
    const { name, domainName } = this.item;
    const data = {
      name,
      domain: domainName,
      select_user: this.groupUsers,
    };
    return data;
  }

  get formItems() {
    return [
      {
        name: 'name',
        type: 'label',
        label: t('Name'),
        iconType: 'group',
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
        disabled: false,
        showSearch: true,
        filterOption: transferFilterOption,
        loading: this.userStore.list.isLoading,
      },
    ];
  }

  onSubmit = async (values) => {
    const { select_user: newUsers } = values;
    const { id } = this.item;
    const promiseList = [];
    this.groupUsers.forEach((userId) => {
      if (newUsers.indexOf(userId) === -1) {
        promiseList.push(this.store.deleteGroupUsers({ id, userId }));
      }
    });
    newUsers.forEach((userId) => {
      if (this.groupUsers.indexOf(userId) === -1) {
        promiseList.push(this.store.addGroupUsers({ id, userId }));
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(ManageUser));
