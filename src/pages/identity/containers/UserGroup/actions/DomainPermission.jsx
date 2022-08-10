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

export class DomainPermission extends ModalAction {
  init() {
    this.store = globalGroupStore;
    this.roleStore = globalRoleStore;
    this.getRoleList();
  }

  componentDidMount() {
    const {
      item: { id, domain_id },
    } = this.props;
    this.store.fetchDomainRole({ id, domain_id });
  }

  async getRoleList() {
    await this.roleStore.fetchList();
    this.updateDefaultValue();
  }

  static id = 'setting-domain-permission';

  static title = t('Edit Domain Permission');

  get name() {
    return t('Edit Domain Permission');
  }

  get rolesList() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get defaultValue() {
    const { name, domain_name } = this.item;
    const { domainRoles } = this.store;
    const roleIds = [];
    domainRoles.map((it) => roleIds.push(it.id));
    if (domainRoles && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        name,
        roles: roleIds,
        domain_name,
      });
    }
    return {};
  }

  static policy = ['identity:update_domain_config', 'identity:list_roles'];

  static allowed = () => Promise.resolve(true);

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
        // TODO: domain admin / domain reader
        mode: 'multiple',
        options: this.rolesList,
      },
      {
        name: 'domain_name',
        label: t('Domain'),
        type: 'input',
        disabled: true,
      },
    ];
  }

  onSubmit = async (values) => {
    const { roles: newRoles } = values;
    const { domainRoles: oldRoles } = this.store;
    const {
      item: { id, domain_id },
    } = this.props;
    const promiseList = [];
    oldRoles.forEach((role) => {
      const { id: roleId } = role;
      if (newRoles.indexOf(roleId) === -1) {
        promiseList.push(
          globalGroupStore.deleteDomainRole({ id, roleId, domain_id })
        );
      }
    });
    newRoles.forEach((roleId) => {
      if (oldRoles.indexOf(roleId) === -1) {
        promiseList.push(
          globalGroupStore.assignDomainRole({ id, roleId, domain_id })
        );
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(DomainPermission));
