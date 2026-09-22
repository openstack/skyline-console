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
import globalSubscriptionStore from 'stores/zaqar/subscription';

export class UpdateSubscription extends ModalAction {
  static id = 'update-subscription';

  static title = t('Update Subscription');

  static buttonText = t('Update');

  static policy = 'subscription:update';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalSubscriptionStore;
  }

  get queueName() {
    const { match } = this.containerProps || {};
    return match && match.params && match.params.id;
  }

  get name() {
    return t('Update Subscription');
  }

  get instanceName() {
    return this.item.id;
  }

  get defaultValue() {
    return {
      ttl: this.item.ttl || 3600,
    };
  }

  get formItems() {
    return [
      {
        name: 'ttl',
        label: t('TTL (seconds)'),
        type: 'input-number',
        required: true,
        min: 60,
        max: 1209600,
        help: t('Time-to-live in seconds for the subscription.'),
      },
    ];
  }

  onSubmit = (values) =>
    globalSubscriptionStore.update(
      { id: this.item.id, queueName: this.queueName },
      { ttl: values.ttl }
    );
}

export default inject('rootStore')(observer(UpdateSubscription));
