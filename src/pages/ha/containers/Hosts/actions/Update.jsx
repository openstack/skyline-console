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
import { ModalAction } from 'src/containers/Action';
import globalHostStore from 'src/stores/masakari/hosts';

export class Update extends ModalAction {
  init() {
    this.store = globalHostStore;
  }

  static id = 'UpdateHost';

  static title = t('Update');

  get name() {
    return t('Update');
  }

  static policy = 'baremetal:port:Update';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {
      ...this.item,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Host Name'),
        type: 'input',
        disabled: true,
        required: true,
      },
      {
        name: 'reserved',
        label: t('Reserved'),
        type: 'switch',
        checkedText: '',
        uncheckedText: '',
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'input',
        required: true,
      },
      {
        name: 'control_attributes',
        label: t('Control Attribute'),
        type: 'input',
        required: true,
      },
      {
        name: 'on_maintenance',
        label: t('On Maintenance'),
        type: 'switch',
        checkedText: '',
        uncheckedText: '',
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.update(this.item.failover_segment_id, this.item.uuid, {
      host: values,
    });
  };
}

export default inject('rootStore')(observer(Update));
