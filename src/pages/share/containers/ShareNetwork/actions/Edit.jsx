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
import globalShareNetworkStore from 'stores/manila/share-network';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit');

  get defaultValue() {
    const { name, description } = this.item;
    const value = {
      name,
      description,
    };
    return value;
  }

  static policy = 'share_network:update';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  init() {
    this.store = globalShareNetworkStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.update(id, values);
  };
}

export default inject('rootStore')(observer(Edit));
