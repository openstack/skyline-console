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
import globalReverseStore from 'src/stores/designate/reverse';

export class Set extends ModalAction {
  init() {
    this.store = globalReverseStore;
  }

  static id = 'set-reverse';

  static title = t('Set');

  static get modalSize() {
    return 'small';
  }

  get name() {
    return t('Set Domain Name PTR');
  }

  static policy = 'get_images';

  static allowed() {
    return Promise.resolve(true);
  }

  get formItems() {
    return [
      {
        name: 'ptrdname',
        label: t('Domain Name'),
        type: 'input',
        required: true,
        placeholder: t('smtp.example.com'),
        tip: t('Domain name ending in.'),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        tip: t('Details about the PTR record.'),
      },
      {
        name: 'ttl',
        label: t('TTL'),
        type: 'input-number',
        min: 0,
        tip: t('Time To Live in seconds.'),
        placeholder: t('3600'),
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.set({ id }, values);
  };
}

export default inject('rootStore')(observer(Set));
