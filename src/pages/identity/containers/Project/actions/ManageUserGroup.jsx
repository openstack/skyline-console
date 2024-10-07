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
import {
  groupDomainColumns,
  transferFilterOption,
} from 'resources/keystone/domain';
import { roleFilterOption } from 'resources/keystone/role';

export class ManageUserGroup extends ModalAction {
  static id = 'manage-group-group';

  static title = t('Manage User Group');

  async init() {
    this.state.groupRoles = this.getInitRoleMap();
    this.userGroupStore = new GroupStore();
    this.store = globalRoleStore;
    this.getRoleList();
    this.getGroupGroup();
  }

  get name() {
    return t('Manage user group');
  }

  getInitRoleMap() {
    const { groups = {} } = this.item;
    return Object.keys(groups).reduce((pre, cur) => {
      pre[cur] = groups[cur].map((it) => it.id);
      return pre;
    }, {});
  }

  getGroupGroup() {
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

  get groupList() {
    return (this.userGroupStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get projectRoleList() {
    return this.store.list.data || [];
  }

  groupRolesList = (groupId) =>
    this.projectRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      key: it.id,
      groupId,
    }));

  defaultRoles = (groupId) => {
    const { groups } = this.item;
    if (!groups[groupId]) {
      return [this.projectRoleList[0].id];
    }
    const groupProjectRole = groups[groupId].map((it) => {
      return it.id;
    });
    return groupProjectRole;
  };

  static policy = ['identity:create_grant', 'identity:revoke_grant'];

  static allowed = () => Promise.resolve(true);

  get leftGroupGroupTable() {
    return groupDomainColumns;
  }

  onClickSelect = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  renderSelect = (groupId) => {
    return (
      <Select
        size="small"
        mode="multiple"
        options={this.groupRolesList(groupId)}
        defaultValue={this.defaultRoles(groupId)}
        filterOption={roleFilterOption}
        onChange={(value, option) => {
          this.onSubChange(value, option, groupId);
        }}
        onClick={this.onClickSelect}
      />
    );
  };

  get rightGroupGroupTable() {
    return [
      ...groupDomainColumns,
      {
        title: t('Select Project Role'),
        dataIndex: 'id',
        render: (id) => this.renderSelect(id),
      },
    ];
  }

  onSubChange = (value, option, groupId) => {
    const { groupRoles } = this.state;
    if (value.length && option.length) {
      groupRoles[groupId] = value;
    } else {
      groupRoles[groupId] = [];
    }
    this.setState({ groupRoles }, () => {
      this.formRef.current.validateFields();
    });
  };

  onChangeUserGroup = (value) => {
    const { groupRoles } = this.state;
    (value || []).forEach((groupId) => {
      if (!groupRoles[groupId]) {
        groupRoles[groupId] = this.defaultRoles(groupId);
      }
    });
    Object.keys(groupRoles).forEach((groupId) => {
      if (!(value || []).includes(groupId)) {
        delete groupRoles[groupId];
      }
    });
    this.setState(groupRoles);
  };

  validateGroup = () => {
    const { groupRoles } = this.state;
    if (!groupRoles) {
      return Promise.resolve();
    }
    const emptyGroupRole = Object.keys(groupRoles).find((gId) => {
      return !groupRoles[gId].length;
    });
    if (emptyGroupRole) {
      return Promise.reject(t('Please set at least one role!'));
    }
    return Promise.resolve();
  };

  get defaultValue() {
    const { name, domainName } = this.item;
    const data = {
      name,
      domain: domainName,
    };
    return data;
  }

  get formItems() {
    const { groups } = this.item;
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
        name: 'select_group',
        label: t('User Group'),
        type: 'transfer',
        leftTableColumns: this.leftGroupGroupTable,
        rightTableColumns: this.rightGroupGroupTable,
        dataSource: this.groupList,
        disabled: false,
        showSearch: true,
        oriTargetKeys: groups ? Object.keys(groups) : [],
        filterOption: transferFilterOption,
        onChange: this.onChangeUserGroup,
        wrapperCol: this.wrapperCol,
        loading: this.userGroupStore.list.isLoading,
        validator: this.validateGroup,
      },
    ];
  }

  onSubmit = async () => {
    const { groupRoles = {} } = this.state;
    const { id } = this.item;
    const oldGroupRoles = this.getInitRoleMap();
    const promiseList = [];
    Object.keys(oldGroupRoles).forEach((groupId) => {
      (oldGroupRoles[groupId] || []).forEach((roleId) => {
        const newRoles = groupRoles[groupId] || [];
        if (!newRoles.includes(roleId)) {
          promiseList.push(
            globalProjectStore.removeGroupRole({ id, groupId, roleId })
          );
        }
      });
    });
    Object.keys(groupRoles).forEach((groupId) => {
      const oldRoles = oldGroupRoles[groupId] || [];
      groupRoles[groupId].forEach((roleId) => {
        if (!oldRoles.includes(roleId)) {
          promiseList.push(
            globalProjectStore.assignGroupRole({ id, groupId, roleId })
          );
        }
      });
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(ManageUserGroup));
