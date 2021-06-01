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
import globalGroupStore from 'stores/keystone/user-group';
import globalRoleStore from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';

@inject('rootStore')
@observer
export default class UserGroupManager extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      groupRoles: {},
      groupList: [],
    };
  }

  componentDidMount() {
    const { groups } = this.item;
    globalGroupStore.fetchGroupData().then((res) => {
      const domainUsers = res.filter(
        (it) => it.domain_id === this.item.domain_id
      );
      const groupList = domainUsers.map((it) => ({
        ...it,
        key: it.id,
      }));
      this.setState({ groupList });
    });
    this.setState({ groupRoles: { ...groups } });
  }

  static id = 'management-user-group';

  static title = t('Manage User Group');

  init() {
    // this.userGroupStore = globalGroupStore;
    this.store = globalRoleStore;
    // this.getUserGroup();
    this.getRoleList();
  }

  get name() {
    return t('Manager user group');
  }

  getUserGroup() {
    this.userGroupStore.fetchList();
  }

  getRoleList() {
    this.store.fetchList();
  }

  static get modalSize() {
    return 'middle';
  }

  get item() {
    const { item } = this.props;
    item.roles = {};
    return item;
  }

  get projectRoleList() {
    const projectRole = this.store.list.data || [];
    return projectRole;
  }

  groupRolesList = (groupId) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      groupId,
    }));

  defaultRoles = (groupId) => {
    const { groups, roles } = this.item;
    // const oldUserRoles = groups;
    if (!groups[groupId]) {
      roles[groupId] = [this.projectRoleList[0].id];
    }
    return roles[groupId] || groups[groupId];
  };

  static policy = 'identity:update_project';

  static allowed = () => Promise.resolve(true);

  get leftUserGroupTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  renderSelect = (groupId) => (
    <Select
      size="small"
      options={this.groupRolesList(groupId)}
      defaultValue={this.defaultRoles(groupId)}
      onChange={this.onSubChange}
    />
  );

  get rightUserGroupTable() {
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

  onSubChange = (value, option) => {
    const { groupRoles } = this.state;
    const { groupId } = option;
    groupRoles[groupId] = [value];
    this.setState({ groupRoles });
  };

  get formItems() {
    const { groups } = this.item;
    const { groupList } = this.state;
    return [
      {
        name: 'select_group',
        type: 'transfer',
        leftTableColumns: this.leftUserGroupTable,
        rightTableColumns: this.rightUserGroupTable,
        dataSource: groupList,
        disabled: false,
        showSearch: true,
        oriTargetKeys: groups ? Object.keys(groups) : [],
      },
    ];
  }

  onSubmit = async (values) => {
    const { groupRoles } = this.state;
    const { groups: oldGroupRoles, id } = this.item;
    const defaultGroups = Object.keys(groupRoles);
    const promiseList = [];
    defaultGroups.forEach((group_id) => {
      if (values.select_group.indexOf(group_id) === -1) {
        (oldGroupRoles[group_id] || []).forEach((role_id) => {
          promiseList.push(
            globalProjectStore.removeGroupRole({ id, group_id, role_id })
          );
        });
      } else {
        (oldGroupRoles[group_id] || []).forEach((role_id) => {
          if (groupRoles[group_id].indexOf(role_id) === -1) {
            promiseList.push(
              globalProjectStore.removeGroupRole({ id, group_id, role_id })
            );
          }
        });
      }
    });
    values.select_group.forEach((group_id) => {
      if (defaultGroups.indexOf(group_id) === -1) {
        const role_id = this.projectRoleList[0].id;
        promiseList.push(
          globalProjectStore.assignGroupRole({ id, group_id, role_id })
        );
      } else {
        const role_id = groupRoles[group_id][0];
        if (
          (oldGroupRoles[group_id] && oldGroupRoles[group_id][0] !== role_id) ||
          !oldGroupRoles[group_id]
        ) {
          promiseList.push(
            globalProjectStore.assignGroupRole({ id, group_id, role_id })
          );
        }
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}
