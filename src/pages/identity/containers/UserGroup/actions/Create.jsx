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
import globalGroupStore from 'stores/keystone/user-group';
import { getDomainFormItem } from 'resources/keystone/domain';

export class Create extends ModalAction {
  init() {
    this.store = globalGroupStore;
    this.domainStore = globalDomainStore;
    this.domainStore.fetchDomain();
  }

  static id = 'user-group-create';

  static title = t('Create User Group');

  static policy = 'identity:create_group';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create User Group');
  }

  get defaultValue() {
    const data = {
      domain_id: 'default',
    };
    return data;
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const domainId = this.formRef.current.getFieldValue('domain_id');
    if (!domainId) {
      return Promise.resolve();
    }
    const { list: { data = [] } = {} } = this.store;
    const nameUsed = data.find(
      (it) => it.name === value && it.domain_id === domainId
    );
    if (nameUsed) {
      return Promise.reject(
        t('Invalid: User Group names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const domainFormItem = getDomainFormItem(this);
    return [
      {
        name: 'name',
        label: t('User Group Name'),
        type: 'input',
        placeholder: t('Please input name'),
        required: true,
        validator: this.checkName,
        extra: t('User Groups') + t('Name can not be duplicated'),
        maxLength: 30,
        dependencies: ['domain_id'],
      },
      domainFormItem,
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.create(values);
  };
}

export default inject('rootStore')(observer(Create));
