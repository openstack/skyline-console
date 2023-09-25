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
import globalShareTypeStore from 'stores/manila/share-type';
import { projectTableOptions } from 'resources/keystone/project';
import { ProjectStore } from 'stores/keystone/project';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { isEmpty } from 'lodash';
import { yesNoOptions } from 'resources/manila/share-type';
import { updateAddSelectValueToObj } from 'utils/index';

export const keyValueValidator = (rule, values) => {
  if (isEmpty(values)) {
    return Promise.resolve();
  }
  const item = values.find((it) => {
    const { key, value } = it.value || {};
    return !key || !value;
  });
  return item
    ? Promise.reject(t('Please enter complete key value!'))
    : Promise.resolve();
};

export const extraFormItem = {
  name: 'extra',
  label: t('Extra Specs'),
  type: 'add-select',
  itemComponent: KeyValueInput,
  addText: t('Add Extra Spec'),
  keySpan: 8,
  validator: keyValueValidator,
};

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Share Type');

  get name() {
    return t('create share type');
  }

  init() {
    this.store = globalShareTypeStore;
    this.projectStore = new ProjectStore();
    this.getProjects();
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return this.projectStore.list.data || [];
  }

  static policy = 'share_type:create';

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
    return { isPublic: true };
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
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'driver_handles_share_servers',
        label: t('Driver Handles Share Servers'),
        type: 'select',
        options: yesNoOptions,
        required: true,
      },
      {
        name: 'isPublic',
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
    const {
      driver_handles_share_servers,
      isPublic = false,
      accessControl = {},
      extra = [],
      ...rest
    } = values;
    const body = { ...rest };
    let projectIds = [];
    const extraSpecs = updateAddSelectValueToObj(extra);
    extraSpecs.driver_handles_share_servers = driver_handles_share_servers;
    body.extra_specs = extraSpecs;
    if (isPublic) {
      body['os-share-type-access:is_public'] = true;
    } else {
      body['os-share-type-access:is_public'] = false;
      const { selectedRowKeys = [] } = accessControl;
      projectIds = [...selectedRowKeys];
    }
    return this.store.create(body, projectIds);
  };
}

export default inject('rootStore')(observer(Create));
