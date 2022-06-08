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
import { UserStore } from 'stores/keystone/user';
import globalRoleStore from 'stores/keystone/role';

export class SystemRole extends ModalAction {
  init() {
    this.store = new UserStore();
    this.roleStore = globalRoleStore;
    this.getRoleList();
  }

  getRoleList() {
    this.roleStore.fetchSystemRoles();
  }

  static id = 'edit-system-permission';

  static title = t('Edit System Permission');

  get name() {
    return t('edit system permission');
  }

  get rolesList() {
    return (this.roleStore.systemRoles.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get defaultValue() {
    const { name, systemRoles = [] } = this.item;
    const roles = systemRoles.map((it) => it.id);
    const role = roles[0];
    if (role) {
      return { name, role };
    }
    return { name };
  }

  static policy = 'identity:list_roles';

  static allowed(item, containerProps) {
    const { match: { path = '' } = {} } = containerProps || {};
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
        name: 'role',
        label: t('Role'),
        type: 'select',
        options: this.rolesList,
        loading: this.roleStore.systemRoles.isLoading,
      },
    ];
  }

  onSubmit = async (values) => {
    const { role: newRole } = values;
    const { systemRoles: oldRoles, id } = this.item;
    const promiseList = [];
    const newRoles = newRole ? [newRole] : [];
    const oldRoleIds = oldRoles.map((it) => it.id);
    oldRoles.forEach((role) => {
      const { id: roleId } = role;
      if (!newRoles.includes(roleId)) {
        promiseList.push(this.store.deleteSystemRole({ id, roleId }));
      }
    });
    newRoles.forEach((roleId) => {
      if (!oldRoleIds.includes(roleId)) {
        promiseList.push(this.store.assignSystemRole({ id, roleId }));
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}
export default inject('rootStore')(observer(SystemRole));
