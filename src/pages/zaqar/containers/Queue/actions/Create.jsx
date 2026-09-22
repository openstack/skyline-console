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

export class Create extends ModalAction {
  static id = 'create-queue';

  static title = t('Create Queue');

  static policy = 'queues:create';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalQueueStore;
  }

  get name() {
    return t('Create Queue');
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Queue Name'),
        type: 'input',
        required: true,
        placeholder: t('Enter queue name'),
        help: t(
          'Queue names may only contain letters, digits, underscores and hyphens.'
        ),
      },
    ];
  }

  onSubmit = (values) => globalQueueStore.create({ name: values.name });
}

export default inject('rootStore')(observer(Create));
