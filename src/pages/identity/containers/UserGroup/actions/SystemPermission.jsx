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
import { ModalAction } from 'containers/Action';
import globalGroupStore from 'stores/keystone/user-group';
import globalRoleStore from 'stores/keystone/role';

export class SystemPermission extends ModalAction {
  init() {
    this.store = globalGroupStore;
    this.roleStore = globalRoleStore;
    this.getRoleList();
  }

  componentDidMount() {
    const {
      item: { id },
    } = this.props;
    this.store.fetchSystemRole({ id });
  }

  getRoleList() {
    this.roleStore.fetchList();
  }

  static id = 'edit-system-permission';

  static title = t('Edit System Permission');

  get name() {
    return t('edit system permission');
  }

  get rolesList() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get defaultValue() {
    const { name } = this.item;
    const { systemRoles } = this.store;
    const roleIds = [];
    systemRoles.map((it) => roleIds.push(it.id));
    if (systemRoles && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        name,
        roles: roleIds,
      });
    }
    return {};
  }

  static policy = 'identity:list_roles';

  static allowed(item, containerProps) {
    const {
      match: { path },
    } = containerProps;
    if (path.indexOf('domain-admin/detail') >= 0) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User'),
        type: 'label',
        iconType: 'user',
      },
      {
        name: 'roles',
        label: t('Role'),
        type: 'select',
        // TODO: platform admin / platform reader
        mode: 'multiple',
        options: this.rolesList,
      },
    ];
  }

  onSubmit = async (values) => {
    const { roles: newRoles } = values;
    const { systemRoles: oldRoles } = this.store;
    const {
      item: { id },
    } = this.props;
    const promiseList = [];
    oldRoles.forEach((role) => {
      const { id: roleId } = role;
      if (newRoles.indexOf(roleId) === -1) {
        promiseList.push(globalGroupStore.deleteSystemRole({ id, roleId }));
      }
    });
    newRoles.forEach((roleId) => {
      if (oldRoles.indexOf(roleId) === -1) {
        promiseList.push(globalGroupStore.assignSystemRole({ id, roleId }));
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(SystemPermission));
