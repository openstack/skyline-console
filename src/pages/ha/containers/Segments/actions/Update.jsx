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
import globalSegmentStore from 'src/stores/masakari/segments';

export class Update extends ModalAction {
  init() {
    this.store = globalSegmentStore;
  }

  static id = 'UpdateSegment';

  static title = t('Update');

  get name() {
    return t('Update Segment');
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
        label: t('Segment Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'recovery_method',
        label: t('Recovery Method'),
        type: 'select',
        options: [
          { label: t('auto'), value: 'auto' },
          { label: t('auto_priority'), value: 'auto_priority' },
          { label: t('reserved_host'), value: 'reserved_host' },
          { label: t('rh_priority'), value: 'rh_priority' },
        ],
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        rows: 4,
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.update(this.item.uuid, { segment: values });
  };
}

export default inject('rootStore')(observer(Update));
