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
import globalFlavorStore from 'stores/nova/flavor';
import { ModalAction } from 'containers/Action';
import { ProjectStore } from 'stores/keystone/project';
import { projectTableOptions } from 'resources/keystone/project';

export class ManageAccess extends ModalAction {
  static id = 'manage-access';

  static title = t('Manage Access');

  init() {
    this.store = globalFlavorStore;
    this.projectStore = new ProjectStore();
    this.getAccess();
    this.getProjects();
  }

  get name() {
    return t('Manage Access');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  static policy = [
    'os_compute_api:os-flavor-access',
    'os_compute_api:os-flavor-access:add_tenant_access',
    'os_compute_api:os-flavor-access:remove_tenant_access',
  ];

  static allowed = (item) => Promise.resolve(!item.is_public);

  async getAccess() {
    await this.store.fetchAccess(this.item.id);
    this.updateDefaultValue();
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return this.projectStore.list.data || [];
  }

  get defaultValue() {
    const { name } = this.item;
    return {
      name,
      access: {
        selectedRowKeys: this.currentAccess,
      },
    };
  }

  get currentAccess() {
    return (this.store.access || []).map((it) => it.tenant_id);
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Flavor Name'),
        type: 'label',
        iconType: 'flavor',
      },
      {
        name: 'access',
        label: t('Access Control'),
        type: 'select-table',
        isMulti: true,
        required: true,
        isLoading: this.projectStore.list.isLoading,
        data: this.projects,
        ...projectTableOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { access } = values;
    if (!access) {
      return Promise.resolve();
    }
    const { selectedRowKeys } = access;
    const { id } = this.item;
    const adds = selectedRowKeys.filter(
      (it) => this.currentAccess.indexOf(it) < 0
    );
    const dels = this.currentAccess.filter(
      (it) => selectedRowKeys.indexOf(it) < 0
    );
    return globalFlavorStore.updateAccess(id, adds, dels);
  };
}

export default inject('rootStore')(observer(ManageAccess));
