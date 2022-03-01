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
import { GroupStore } from 'stores/keystone/user-group';
import globalRoleStore from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';

export class UserGroupManager extends ModalAction {
  static id = 'management-user-group';

  static title = t('Manage User Group');

  init() {
    const roles = JSON.stringify(this.item.groups);
    this.state.domainDefault = this.item.domain_id;
    this.state.groupRoles = JSON.parse(roles);
    this.userGroupStore = new GroupStore();
    this.store = globalRoleStore;
    this.getUserGroup();
    this.getRoleList();
  }

  get name() {
    return t('Manager user group');
  }

  get multipleMode() {
    return 'multiple';
  }

  getUserGroup() {
    this.userGroupStore.fetchList();
  }

  getRoleList() {
    this.store.fetchList();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get item() {
    const { item } = this.props;
    item.roles = {};
    return item;
  }

  get groupList() {
    return (this.userGroupStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get projectRoleList() {
    const projectRole = this.store.list.data || [];
    return projectRole;
  }

  groupRolesList = (groupId) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
      groupId,
    }));

  defaultRoles = (groupId) => {
    const { groups, roles } = this.item;
    const { groupRoles: projectGroups } = this.state;
    const filterGroups = this.multipleMode ? groups : projectGroups;
    if (!filterGroups[groupId]) {
      roles[groupId] = [this.projectRoleList[0].id];
    } else {
      const usersProjectRole = filterGroups[groupId].filter((it) => {
        const projectRole = this.projectRoleList.find((role) => role.id === it);
        return !!projectRole;
      });
      return this.multipleMode
        ? usersProjectRole
        : usersProjectRole.slice(0, 1);
    }
    return roles[groupId];
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

  renderSelect = (groupId) => {
    return (
      <Select
        size="small"
        mode={this.multipleMode}
        options={this.groupRolesList(groupId)}
        defaultValue={this.defaultRoles(groupId)}
        onChange={this.onSubChange}
      />
    );
  };

  get rightUserGroupTable() {
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

  onSubChange = (value, option) => {
    if (
      (this.multipleMode && value.length && option.length) ||
      (!this.multipleMode && value && option)
    ) {
      const { groupRoles } = this.state;
      const { groupId } = this.multipleMode ? option[0] : option;
      groupRoles[groupId] = this.multipleMode ? value : [value];
      this.setState({ groupRoles });
    } else {
      this.setState({ groupRoles: {} });
    }
  };

  get formItems() {
    const { groups } = this.item;
    const { domainDefault } = this.state;
    return [
      {
        name: 'select_group',
        type: 'transfer',
        leftTableColumns: this.leftUserGroupTable,
        rightTableColumns: this.rightUserGroupTable,
        dataSource: this.groupList
          ? this.groupList.filter((it) => it.domain_id === domainDefault)
          : [],
        disabled: false,
        showSearch: true,
        oriTargetKeys: groups ? Object.keys(groups) : [],
      },
    ];
  }

  onSubmit = async (values) => {
    const { groupRoles } = this.state;
    if (!this.multipleMode) {
      // If it is not multiple choices, role only takes the first item of the array
      Object.keys(groupRoles).forEach((key) => {
        groupRoles[key] = groupRoles[key].slice(0, 1);
      });
    }
    const { groups: oldGroupRoles, id } = this.item;
    const defaultGroups = Object.keys(groupRoles);
    const promiseList = [];
    defaultGroups.forEach((group_id) => {
      if (!values.select_group.includes(group_id)) {
        (oldGroupRoles[group_id] || []).forEach((role_id) => {
          promiseList.push(
            globalProjectStore.removeGroupRole({ id, group_id, role_id })
          );
        });
      } else {
        (oldGroupRoles[group_id] || []).forEach((role_id) => {
          if (!groupRoles[group_id].includes(role_id)) {
            promiseList.push(
              globalProjectStore.removeGroupRole({ id, group_id, role_id })
            );
          }
        });
      }
    });
    values.select_group.forEach((group_id) => {
      if (!defaultGroups.includes(group_id)) {
        if (groupRoles[group_id]) {
          groupRoles[group_id].forEach((role_id) => {
            promiseList.push(
              globalProjectStore.assignGroupRole({ id, group_id, role_id })
            );
          });
        } else {
          promiseList.push(
            globalProjectStore.assignGroupRole({
              id,
              group_id,
              role_id: this.projectRoleList[0].id,
            })
          );
        }
      } else {
        (groupRoles[group_id] || []).forEach((role_id) => {
          if (
            (oldGroupRoles[group_id] &&
              !oldGroupRoles[group_id].includes(role_id)) ||
            !oldGroupRoles[group_id]
          ) {
            promiseList.push(
              globalProjectStore.assignGroupRole({ id, group_id, role_id })
            );
          }
        });
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(UserGroupManager));
