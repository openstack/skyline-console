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
import globalShareGroupTypeStore, {
  ShareGroupTypeStore,
} from 'stores/manila/share-group-type';
import { ModalAction } from 'containers/Action';
import { ProjectStore } from 'stores/keystone/project';
import { projectTableOptions } from 'resources/keystone/project';

export class ManageAccess extends ModalAction {
  static id = 'manage-access';

  static title = t('Manage Access');

  init() {
    this.store = new ShareGroupTypeStore();
    this.projectStore = new ProjectStore();
    this.getAccess();
    this.getProjects();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  static policy = [
    'share_group_type:list_project_access',
    'share_group_type:add_project_access',
    'share_group_type:remove_project_access',
  ];

  static allowed = (item) => Promise.resolve(!item.is_public);

  async getAccess() {
    const { is_public } = this.item;
    if (!is_public) {
      await this.store.fetchProjectAccess(this.item.id);
      this.updateDefaultValue();
    }
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get name() {
    return t('Manage Access');
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
    return (this.store.access || []).map((it) => it.project_id);
  }

  get formItems() {
    const { isPublic } = this.state;
    return [
      {
        name: 'name',
        label: t('Share Type'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'access',
        label: t('Access Control'),
        type: 'select-table',
        isMulti: true,
        hidden: isPublic,
        data: this.projects,
        isLoading: this.projectStore.list.isLoading,
        ...projectTableOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { access = {} } = values;
    const { id } = this.item;
    const body = { id };
    const { selectedRowKeys = [] } = access;
    body.adds = selectedRowKeys.filter(
      (it) => this.currentAccess.indexOf(it) < 0
    );
    body.dels = this.currentAccess.filter(
      (it) => selectedRowKeys.indexOf(it) < 0
    );
    return globalShareGroupTypeStore.updateProjectAccess(body);
  };
}

export default inject('rootStore')(observer(ManageAccess));
