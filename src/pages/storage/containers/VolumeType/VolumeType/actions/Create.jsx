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
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import { projectTableOptions } from 'resources/keystone/project';
import { ProjectStore } from 'stores/keystone/project';
import { toJS } from 'mobx';
import { multiTip } from 'resources/cinder/volume';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Volume Type');

  get name() {
    return t('create volume type');
  }

  init() {
    this.store = globalVolumeTypeStore;
    this.projectStore = new ProjectStore();
    this.getProjects();
    // TODO: get cinder service list
    // this.serviceStore = globalServiceStore;
    // this.getServices();
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return this.projectStore.list.data || [];
  }

  get services() {
    const servicesMap = [
      {
        label: t('Do not set with a backend'),
        value: -1,
      },
    ];
    const existingBackends = [];
    const data = toJS(this.serviceStore.cinderServiceList.data) || [];
    if (data.length > 0) {
      data.forEach((service) => {
        if (service.binary === 'cinder-volume') {
          const { host } = service;
          const result = host.split('@')[1];
          if (existingBackends.indexOf(result) === -1) {
            const item = {
              label: result,
              value: result,
            };
            servicesMap.push(item);
            existingBackends.push(result);
          }
        }
      });
    }
    return servicesMap;
  }

  static policy = 'volume_extension:type_create';

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

  // TODO: get cinder service list
  // get defaultValue() {
  //   const value = {
  //     backend: -1,
  //   };
  //   return value;
  // }

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
      // TODO: get cinder service list
      // {
      //   name: 'backend',
      //   label: t('Backend'),
      //   type: 'select',
      //   options: this.services,
      //   required: true,
      // },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'multiattach',
        label: t('Shared'),
        type: 'check',
        content: t('Shared'),
        extra: multiTip,
      },
      {
        // 'os-volume-type-access:is_public'
        name: 'isPublic',
        label: t('Public'),
        type: 'check',
        content: t('Public'),
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
    ];
  }

  onSubmit = (values) => {
    const {
      multiattach,
      isPublic = false,
      accessControl = {},
      ...rest
    } = values;
    const body = { ...rest };
    let projectIds = [];
    if (multiattach) {
      body.extra_specs = {
        multiattach: '<is> True',
      };
    }
    if (isPublic) {
      body['os-volume-type-access:is_public'] = true;
    } else {
      body['os-volume-type-access:is_public'] = false;
      const { selectedRowKeys = [] } = accessControl;
      projectIds = [...selectedRowKeys];
    }
    return this.store.create(body, projectIds);
  };
}

export default inject('rootStore')(observer(Create));
