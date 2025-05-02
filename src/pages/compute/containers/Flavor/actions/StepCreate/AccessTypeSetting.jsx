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
import Base from 'components/Form';
import { ProjectStore } from 'stores/keystone/project';
import { projectTableOptions } from 'resources/keystone/project';

export class AccessTypeSetting extends Base {
  init() {
    this.projectStore = new ProjectStore();
    this.getProjects();
  }

  get isStep() {
    return true;
  }

  get projects() {
    return this.projectStore.list.data || [];
  }

  get defaultValue() {
    const data = {
      accessType: this.accessTypeList[0].value,
      accessControl: this.targetKeys,
    };
    return data;
  }

  get accessTypeList() {
    return [
      {
        label: t('Public'),
        value: 'public',
      },
      {
        label: t('Access Control'),
        value: 'accessControl',
      },
    ];
  }

  async getProjects() {
    this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get formItems() {
    const { accessType } = this.state;
    const showChoose = accessType !== this.accessTypeList[0].value;
    return [
      {
        name: 'accessType',
        label: t('Access Type'),
        type: 'radio',
        options: this.accessTypeList,
      },
      {
        name: 'accessControl',
        label: t('Access Control'),
        type: 'select-table',
        isMulti: true,
        hidden: !showChoose,
        required: showChoose,
        data: this.projects,
        isLoading: this.projectStore.list.isLoading,
        ...projectTableOptions,
      },
    ];
  }
}

export default inject('rootStore')(observer(AccessTypeSetting));
