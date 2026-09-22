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

import React from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import Base from 'containers/List';
import globalQueueStore from 'stores/zaqar/queue';
import { zaqarEndpoint } from 'client/client/constants';
import { actionConfigs } from './actions';

export class Queue extends Base {
  init() {
    this.store = globalQueueStore;
  }

  get policy() {
    return 'queues:get_all';
  }

  get endpoint() {
    return zaqarEndpoint();
  }

  get checkEndpoint() {
    return true;
  }

  get name() {
    return t('Queues');
  }

  get rowKey() {
    return 'name';
  }

  get hideDownload() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns() {
    const basePath = this.isAdminPage
      ? '/messaging/queues-admin'
      : '/messaging/queues';
    return [
      {
        title: t('Queue Name'),
        dataIndex: 'name',
        width: 240,
        render: (value) =>
          value ? (
            <Link to={`${basePath}/${encodeURIComponent(value)}`}>{value}</Link>
          ) : (
            '-'
          ),
      },
      {
        title: t('Messages Total'),
        dataIndex: 'messages_total',
        width: 150,
        render: (_, record) => {
          const total =
            record.stats &&
            record.stats.messages &&
            record.stats.messages.total;
          return total !== undefined ? total : '-';
        },
      },
      {
        title: t('Messages Free'),
        dataIndex: 'messages_free',
        width: 150,
        render: (_, record) => {
          const free =
            record.stats && record.stats.messages && record.stats.messages.free;
          return free !== undefined ? free : '-';
        },
      },
      {
        title: t('Messages Claimed'),
        dataIndex: 'messages_claimed',
        width: 150,
        render: (_, record) => {
          const claimed =
            record.stats &&
            record.stats.messages &&
            record.stats.messages.claimed;
          return claimed !== undefined ? claimed : '-';
        },
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Queue Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Queue));
