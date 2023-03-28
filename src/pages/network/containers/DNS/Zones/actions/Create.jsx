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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import globalDNSZonesStore from 'src/stores/designate/zones';
import { emailValidate } from 'utils/validate';
export class Create extends ModalAction {
  init() {
    this.store = globalDNSZonesStore;
  }

  static id = 'create-dns-zone';

  static title = t('Create Zone');

  static get modalSize() {
    return 'small';
  }

  get name() {
    return t('Create Zone');
  }

  static policy = 'get_images';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    return {
      ttl: 3600,
      type: 'PRIMARY'
    }
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea'
      },
      {
        name: 'email',
        label: t('Email Address'),
        type: 'input',
        required: true,
        validator: emailValidate,
      },
      {
        name: 'ttl',
        label: t('TTL'),
        type: 'input-number',
        min: 0,
        required: true
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'select',
        options: [
          { label: t('Primary'), value: 'PRIMARY' },
          { label: t('Secondary'), value: 'SECONDARY' },
        ]
      },
    ]
  }

  onSubmit = (values) => {
    return this.store.create(values);
  };
}

export default inject('rootStore')(observer(Create));
