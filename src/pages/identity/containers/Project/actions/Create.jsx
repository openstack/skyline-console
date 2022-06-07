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
import globalDomainStore from 'stores/keystone/domain';
import globalProjectStore from 'stores/keystone/project';
import { regex } from 'utils/validate';
import { statusTypes, getDomainFormItem } from 'resources/keystone/domain';

export class Create extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      domain: null,
      newUserRoles: {},
      newGroupRoles: {},
    };
  }

  init() {
    this.domainStore = globalDomainStore;
    this.projectStore = globalProjectStore;
    this.getDomains();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  static id = 'project-create';

  static title = t('Create Project');

  static policy = [
    'identity:create_project',
    'identity:list_domains',
    'identity:list_roles',
    'identity:list_users',
  ];

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Project');
  }

  get defaultValue() {
    const data = {
      domain_id: 'default',
      enabled: statusTypes[0],
    };
    return data;
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const { nameRegexWithoutChinese } = regex;
    if (!nameRegexWithoutChinese.test(value)) {
      return Promise.reject(t('Invalid: Project name can not be chinese'));
    }
    const {
      list: { data },
    } = this.projectStore;
    const nameUsed = data.filter((it) => it.name === value);
    if (nameUsed[0]) {
      return Promise.reject(t('Invalid: Project name can not be duplicated'));
    }
    return Promise.resolve();
  };

  get formItems() {
    const domainFormItem = getDomainFormItem(this);
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
        placeholder: t('Please input name'),
        validator: this.checkName,
        extra: t('Project') + t('Name can not be duplicated'),
        maxLength: 30,
      },
      domainFormItem,
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
        isWrappedValue: true,
        tip: t(
          'Disabling the project will have a negative impact. If the users associated with the project are only assigned to the project, they will not be able to log in'
        ),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    values.enabled = values.enabled.value;
    return this.projectStore.create(values);
  };
}

export default inject('rootStore')(observer(Create));
