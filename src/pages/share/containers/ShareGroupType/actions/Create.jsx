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
import globalShareGroupTypeStore from '@/stores/manila/share-group-type';
import { projectTableOptions } from 'resources/project';
import { ProjectStore } from 'stores/keystone/project';
import { updateAddSelectValueToObj } from 'utils/index';
import { extraFormItem } from 'pages/share/containers/ShareType/actions/Create';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Share Group Type');

  get name() {
    return t('create share group type');
  }

  init() {
    this.store = globalShareGroupTypeStore;
    this.projectStore = new ProjectStore();
    this.getProjects();
  }

  getProjects() {
    this.projectStore.fetchList();
  }

  get projects() {
    return this.projectStore.list.data || [];
  }

  static policy = 'manila:share_group_type:create';

  static allowed = () => Promise.resolve(true);

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get nameForStateUpdate() {
    return ['isPublic'];
  }

  get defaultValue() {
    return { is_public: true };
  }

  get formItems() {
    const { isPublic } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        names: this.store.list.data.map((it) => it.name),
        required: true,
      },
      {
        name: 'is_public',
        label: t('Public'),
        type: 'check',
        content: t('Public'),
        required: true,
      },
      {
        name: 'accessControl',
        label: t('Access Control'),
        type: 'select-table',
        isMulti: true,
        hidden: isPublic,
        data: this.projects,
        isLoading: this.projectStore.list.isLoading,
        ...projectTableOptions,
      },
      extraFormItem,
    ];
  }

  onSubmit = (values) => {
    const { is_public, accessControl = {}, extra = [], ...rest } = values;
    const body = { is_public, ...rest };
    let projectIds = [];
    const extraSpecs = updateAddSelectValueToObj(extra);
    body.group_specs = extraSpecs;
    if (!is_public) {
      const { selectedRowKeys = [] } = accessControl;
      projectIds = [...selectedRowKeys];
    }
    return this.store.create(body, projectIds);
  };
}

export default inject('rootStore')(observer(Create));
