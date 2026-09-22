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
import Base from 'containers/List';
import globalSubscriptionStore from 'stores/zaqar/subscription';
import { actionConfigs } from './actions';

export class SubscriptionList extends Base {
  init() {
    this.store = globalSubscriptionStore;
  }

  get policy() {
    return 'subscription:get_all';
  }

  get name() {
    return t('Subscriptions');
  }

  get rowKey() {
    return 'id';
  }

  get hideDownload() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get queueName() {
    const { match } = this.props;
    return match && match.params && match.params.id;
  }

  get initFilter() {
    return { queueName: this.queueName };
  }

  getColumns() {
    return [
      {
        title: t('Subscription ID'),
        dataIndex: 'id',
        width: 280,
        render: (value) => value || '-',
      },
      {
        title: t('Subscriber URL'),
        dataIndex: 'subscriber',
        width: 300,
        render: (value) => value || '-',
      },
      {
        title: t('TTL (s)'),
        dataIndex: 'ttl',
        width: 100,
        render: (value) => (value !== undefined ? value : '-'),
      },
      {
        title: t('Age (s)'),
        dataIndex: 'age',
        width: 100,
        render: (value) => (value !== undefined ? value : '-'),
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Subscriber URL'),
        name: 'subscriber',
      },
    ];
  }
}

export default inject('rootStore')(observer(SubscriptionList));
