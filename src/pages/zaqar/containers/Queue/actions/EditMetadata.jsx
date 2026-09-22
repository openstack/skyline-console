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
import globalQueueStore from 'stores/zaqar/queue';

export class EditMetadata extends ModalAction {
  static id = 'edit-queue-metadata';

  static title = t('Edit Metadata');

  static policy = 'queues:update';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalQueueStore;
    this.metadata = {};
    this.fetchMetadata();
  }

  async fetchMetadata() {
    try {
      const result = (await globalQueueStore.getMetadata(this.item.name)) || {};
      const metadata =
        result.metadata ||
        (result.queue && result.queue.metadata) ||
        (!result.name && !result.href ? result : {});
      this.metadata = metadata || {};
      this.updateDefaultValue();
    } catch {
      this.updateDefaultValue();
    }
  }

  get name() {
    return t('Edit Queue Metadata');
  }

  get defaultValue() {
    return {
      metadata: JSON.stringify(
        this.metadata || this.item.metadata || {},
        null,
        2
      ),
    };
  }

  get formItems() {
    return [
      {
        name: 'metadata',
        label: t('Metadata (JSON)'),
        type: 'textarea',
        rows: 10,
        required: false,
        placeholder: '{}',
        help: t('Enter valid JSON for the queue metadata.'),
        validator: (_rule, value) => {
          if (!value || value.trim() === '') {
            return Promise.resolve();
          }
          try {
            JSON.parse(value);
            return Promise.resolve();
          } catch (e) {
            return Promise.reject(new Error(t('Please enter valid JSON.')));
          }
        },
      },
    ];
  }

  onSubmit = (values) => {
    const raw = values.metadata ? values.metadata.trim() : '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw || '{}');
    } catch {
      parsed = {};
    }
    return globalQueueStore.setMetadata(this.item.name, parsed);
  };
}

export default inject('rootStore')(observer(EditMetadata));
