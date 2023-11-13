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
import globalDomainStore from 'stores/keystone/domain';
import { ModalAction } from 'containers/Action';
import { statusTypes } from 'resources/keystone/domain';
import { toJS } from 'mobx';

export class Create extends ModalAction {
  init() {
    this.store = globalDomainStore;
  }

  static id = 'domain-create';

  static title = t('Create Domain');

  static policy = 'identity:create_domain';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Domain');
  }

  get defaultValue() {
    const data = {
      enabled: statusTypes[0],
    };
    return data;
  }

  get currentList() {
    const { list: { data = [] } = {} } = this.store;
    return data;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        placeholder: t('Please input name'),
        required: true,
        validator: this.nameValidator,
      },
      // {
      //   name: 'domainManager',
      //   label: t('Domain Manager'),
      //   type: 'select',
      //   mode: 'multiple',
      //   options: this.domainManager,
      //   isWrappedValue: true,
      // },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
        isWrappedValue: true,
        help: t(
          'Forbidden the domain will have a negative impact, all project and user in domain will be forbidden'
        ),
      },
    ];
  }

  nameValidator = (rule, value) => {
    const data = toJS(this.currentList);
    if (data.find((d) => d.name === value)) {
      return Promise.reject(
        new Error(t('Invalid: Domain name cannot be duplicated'))
      );
    }

    return Promise.resolve(true);
  };

  onSubmit = (values) => {
    values.enabled = values.enabled.value;
    return this.store.create(values);
  };
}

export default inject('rootStore')(observer(Create));
