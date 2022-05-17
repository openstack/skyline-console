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
import globalServerStore from 'stores/nova/instance';

export class Edit extends ModalAction {
  static id = 'edit-server';

  static title = t('Edit Instance');

  static buttonText = t('Edit');

  init() {
    this.store = globalServerStore;
  }

  static policy = 'os_compute_api:servers:update';

  static allowed() {
    return Promise.resolve(true);
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        placeholder: t('Please input name'),
        isInstance: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { name } = values;
    const body = {
      name,
    };
    const { id } = this.item;
    return globalServerStore.edit({ id }, body);
  };
}

export default inject('rootStore')(observer(Edit));
