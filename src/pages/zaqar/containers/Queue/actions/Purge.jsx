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

import { ConfirmAction } from 'containers/Action';
import globalQueueStore from 'stores/zaqar/queue';

export default class PurgeAction extends ConfirmAction {
  get id() {
    return 'purge-queue';
  }

  get title() {
    return t('Purge Queue');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Purge');
  }

  get actionName() {
    return t('Purge all messages from queue');
  }

  confirmContext = () =>
    t(
      'This will permanently delete ALL messages in the queue. This action cannot be undone.'
    );

  policy = 'queues:purge';

  allowed = () => Promise.resolve(true);

  getItemName = (item) => {
    if (!item) return '-';
    return typeof item === 'string' ? item : item.name || '-';
  };

  onSubmit = (item) => globalQueueStore.purge(item.name);
}
