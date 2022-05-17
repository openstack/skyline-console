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
import globalRouterStore from 'stores/neutron/router';
import { ModalAction } from 'containers/Action';

export class Edit extends ModalAction {
  static id = 'edit-router';

  static title = t('Edit Router');

  static buttonText = t('Edit');

  init() {
    this.store = globalRouterStore;
  }

  get defaultValue() {
    const { item } = this.props;
    return {
      name: item.name,
      description: item.description,
    };
  }

  static policy = 'update_router';

  static allowed = (item) => {
    const isNotDefaultRouter = (it) => it.name !== 'Default Router';
    return Promise.resolve(isNotDefaultRouter(item));
  };

  onSubmit = (values) => {
    const { id } = this.item;
    return globalRouterStore.edit({ id }, values);
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        placeholder: t('Please input name'),
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
