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
import globalImageStore, { ImageStore } from 'stores/glance/image';
import { ModalAction } from 'containers/Action';
import { ProjectStore } from 'stores/keystone/project';
import { projectTableOptions } from 'resources/keystone/project';

export class ManageAccess extends ModalAction {
  static id = 'manage-access';

  static title = t('Manage Access');

  init() {
    this.store = new ImageStore();
    this.projectStore = new ProjectStore();
    this.getMembers();
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

  static policy = ['get_members', 'add_member', 'delete_member'];

  static allowed = (item) => Promise.resolve(item.visibility === 'shared');

  async getMembers() {
    const { id } = this.item;
    await this.store.getMembers(id);
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
      members: {
        selectedRowKeys: this.currentMembers,
      },
    };
  }

  get currentMembers() {
    return (this.store.members || []).map((it) => it.member_id);
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Image Name'),
        type: 'label',
        iconType: 'image',
      },
      {
        name: 'members',
        label: t('Project'),
        type: 'select-table',
        isMulti: true,
        required: true,
        data: this.projects,
        isLoading: this.projectStore.list.isLoading,
        ...projectTableOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { members } = values;
    if (!members) {
      return Promise.resolve();
    }
    const { selectedRowKeys } = members;
    const { id } = this.item;
    const adds = selectedRowKeys.filter(
      (it) => this.currentMembers.indexOf(it) < 0
    );
    const dels = this.currentMembers.filter(
      (it) => selectedRowKeys.indexOf(it) < 0
    );
    return globalImageStore.updateMembers(id, adds, dels);
  };
}

export default inject('rootStore')(observer(ManageAccess));
