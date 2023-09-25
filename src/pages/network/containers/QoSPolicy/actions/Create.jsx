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
import globalProjectStore from 'stores/keystone/project';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { projectTableOptions } from 'resources/keystone/project';
import { isAdminPage } from 'utils';
import { toJS } from 'mobx';

export class Create extends ModalAction {
  static id = 'create_qos_policy';

  static title = t('Create QoS Policy');

  get name() {
    return t('Create QoS Policy');
  }

  static get modalSize() {
    const { pathname } = window.location;
    return isAdminPage(pathname) ? 'large' : 'small';
  }

  getModalSize() {
    return this.isAdminPage ? 'large' : 'small';
  }

  static policy = 'create_policy';

  static aliasPolicy = 'neutron:create_policy';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = new QoSPolicyStore();
    this.projectStore = globalProjectStore;
    this.isAdminPage && this.fetchProjectList();
  }

  async fetchProjectList() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return toJS(this.projectStore.list.data) || [];
  }

  get defaultValue() {
    if (this.isAdminPage) {
      return {
        project_id: {
          selectedRowKeys: [this.props.rootStore.user.project.id],
        },
      };
    }
    return {};
  }

  onSubmit = (values) => {
    const { name, description, shared, is_default, project_id } = values;
    return this.store.create({
      name,
      description,
      shared,
      is_default,
      project_id: project_id
        ? project_id.selectedRowKeys[0]
        : this.props.rootStore.user.project.id,
    });
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Policy Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'project_id',
        label: t('Project'),
        type: 'select-table',
        required: this.isAdminPage,
        isLoading: globalProjectStore.list.isLoading,
        data: this.projects,
        hidden: !this.isAdminPage,
        ...projectTableOptions,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'shared',
        label: t('Shared'),
        type: 'switch',
        hidden: !this.isAdminPage,
      },
      {
        name: 'is_default',
        label: t('Default Policy'),
        type: 'switch',
        hidden: !this.isAdminPage,
      },
    ];
  }
}
export default inject('rootStore')(observer(Create));
