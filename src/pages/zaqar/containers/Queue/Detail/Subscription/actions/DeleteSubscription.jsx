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
import globalSubscriptionStore from 'stores/zaqar/subscription';

export default class DeleteSubscriptionAction extends ConfirmAction {
  get id() {
    return 'delete-subscription';
  }

  get title() {
    return t('Delete Subscription');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('Delete subscription');
  }

  policy = 'subscription:delete';

  allowed = () => Promise.resolve(true);

  getItemName = (item) => {
    if (!item) return '-';
    // batch delete passes subscription IDs as strings; row delete passes objects
    return typeof item === 'string' ? item : item.subscriber || item.id || '-';
  };

  get queueName() {
    // containerProps has the parent List component's props (including match.params)
    const { match } = this.containerProps || {};
    return match && match.params && match.params.id;
  }

  onSubmit = (item) =>
    globalSubscriptionStore.delete({ id: item.id, queueName: this.queueName });
}
