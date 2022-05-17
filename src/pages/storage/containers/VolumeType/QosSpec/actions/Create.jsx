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
import globalQosSpecStore from 'stores/cinder/qos-spec';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create QoS Spec');

  get name() {
    return t('Create QoS Spec');
  }

  static policy = 'volume_extension:qos_specs_manage:create';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'consumer',
        label: t('Consumer'),
        type: 'select',
        options: [
          { value: 'front-end', label: t('Frontend') },
          { value: 'back-end', label: t('Backend') },
          { value: 'both', label: t('Both of Frontend and Backend') },
        ],
        required: true,
      },
    ];
  }

  init() {
    this.store = globalQosSpecStore;
  }

  onSubmit = (values) => {
    return this.store.create({ values });
  };
}

export default inject('rootStore')(observer(Create));
