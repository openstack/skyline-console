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
import globalTroveInstanceStore from 'stores/trove/instances';

export class Edit extends ModalAction {
  static id = 'edit-instance';

  static title = t('Edit');

  static buttonText = t('Edit');

  static policy = 'instance:update';

  static allowed() {
    return Promise.resolve(true);
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
        placeholder: t('Please input name'),
      },
    ];
  }

  onSubmit = (values) => {
    const { name } = values;
    const body = {
      instance: {
        name,
      },
    };
    const { id } = this.item;
    return globalTroveInstanceStore.patch({ id }, body);
  };
}

export default inject('rootStore')(observer(Edit));
