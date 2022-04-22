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
import globalGroupStore from 'stores/keystone/user-group';
import { ModalAction } from 'containers/Action';
import globalDomainStore from 'stores/keystone/domain';

export class UserManager extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      domainDefault: this.item.domain_id,
      userList: [],
    };
  }

  init() {
    // this.store = globalUserStore;
    this.domainStore = globalDomainStore;
    this.userStore = new UserStore();
    this.getDomains();
    this.getUser();
  }

  // componentDidMount() {
  //   globalUserStore.fetchList().then((res) => {
  //     const domainUsers = res.filter(it => it.domain_id === this.item.domain_id);
  //     const userList = domainUsers.map(it => ({
  //       ...it,
  //       key: it.id,
  //     }));
  //     this.setState({ userList });
  //   });
  // }

  static id = 'management-user';

  static title = t('Manage User');

  get name() {
    return t('Manager user');
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

  static policy = [
    'identity:list_users_in_group',
    'identity:list_users_in_group',
    'identity:add_user_to_group',
  ];

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
    ];
  }

  onSubChange = (value, option) => {
    const { userRoles } = this.state;
    userRoles[option.userId] = [value];
    this.setState({
      userRoles,
    });
  };

  get defaultValue() {
    const { domain_id: domain } = this.item;
    const data = {
      domain_id: domain || 'default',
    };
    return data;
  }

  get formItems() {
    const { domainDefault } = this.state;
    const { users: oldUsers } = this.item;
    return [
      {
        name: 'domain_id',
        label: t('Affiliated Domain'),
        type: 'select',
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
        oriTargetKeys: oldUsers,
      },
    ];
  }

  onSubmit = async (values) => {
    const { select_user: newUsers } = values;
    const { users: oldUsers } = this.item;
    const { id } = this.item;
    const promiseList = [];
    oldUsers.forEach((user_id) => {
      if (newUsers.indexOf(user_id) === -1) {
        promiseList.push(globalGroupStore.deleteGroupUsers({ id, user_id }));
      }
    });
    newUsers.forEach((user_id) => {
      if (oldUsers.indexOf(user_id) === -1) {
        promiseList.push(globalGroupStore.addGroupUsers({ id, user_id }));
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(UserManager));
