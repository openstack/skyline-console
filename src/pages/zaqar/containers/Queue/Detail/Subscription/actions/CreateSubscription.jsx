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

export class CreateSubscription extends ModalAction {
  static id = 'create-subscription';

  static title = t('Create Subscription');

  static policy = 'subscription:create';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalSubscriptionStore;
  }

  get name() {
    return t('Create Subscription');
  }

  get queueName() {
    // containerProps is the List component's full props including route match
    const { match } = this.containerProps || {};
    if (match && match.params && match.params.id) {
      return match.params.id;
    }
    // fallback: try direct match prop (when action is opened from within the page)
    const { match: directMatch } = this.props || {};
    return directMatch && directMatch.params && directMatch.params.id;
  }

  get formItems() {
    return [
      {
        name: 'subscriber',
        label: t('Subscriber URL'),
        type: 'input',
        required: true,
        placeholder: t('e.g. http://example.com/webhook'),
        help: t(
          'The URL endpoint that will receive event notifications for this queue.'
        ),
      },
      {
        name: 'ttl',
        label: t('TTL (seconds)'),
        type: 'input-number',
        required: false,
        min: 60,
        placeholder: t('Default: 3600'),
        help: t('Time-to-live for the subscription in seconds.'),
      },
    ];
  }

  onSubmit = (values) => {
    const { subscriber, ttl } = values;
    return globalSubscriptionStore.create(
      this.queueName,
      subscriber,
      ttl || 3600
    );
  };
}

export default inject('rootStore')(observer(CreateSubscription));
