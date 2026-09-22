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

import { observer, inject } from 'mobx-react';
import Base from 'containers/TabList';
import MessageTab from './Message';
import ClaimTab from './Claim';
import SubscriptionTab from './Subscription';

export class QueueDetail extends Base {
  get queueName() {
    const { match } = this.props;
    return match && match.params && match.params.id;
  }

  get name() {
    return this.queueName || t('Queue Detail');
  }

  get tabs() {
    return [
      {
        title: t('Messages'),
        key: 'messages',
        component: MessageTab,
      },
      {
        title: t('Claims'),
        key: 'claims',
        component: ClaimTab,
      },
      {
        title: t('Subscriptions'),
        key: 'subscriptions',
        component: SubscriptionTab,
      },
    ];
  }
}

export default inject('rootStore')(observer(QueueDetail));
