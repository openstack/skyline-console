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
import { Tag } from 'antd';
import Base from 'containers/List';
import globalMessageStore from 'stores/zaqar/message';
import { actionConfigs } from './actions';

export class MessageList extends Base {
  init() {
    this.store = globalMessageStore;
  }

  get policy() {
    return 'messages:get_all';
  }

  get name() {
    return t('Messages');
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

  // Pass queueName into the fetchList call so the store can use it
  get initFilter() {
    return { queueName: this.queueName };
  }

  renderClaimStatus = (claimId) => {
    if (!claimId) {
      return <Tag color="green">{t('Free')}</Tag>;
    }
    return (
      <Tag color="orange" title={claimId}>
        {t('Claimed')}
      </Tag>
    );
  };

  renderBody = (body) => {
    if (body === null || body === undefined) {
      return '-';
    }
    let display;
    if (typeof body === 'object') {
      display = JSON.stringify(body);
    } else {
      display = String(body);
    }
    return (
      <span
        title={display}
        style={{
          maxWidth: 300,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }}
      >
        {display}
      </span>
    );
  };

  getColumns() {
    return [
      {
        title: t('Message ID'),
        dataIndex: 'id',
        width: 220,
        render: (value) => (
          <span
            title={value}
            style={{
              fontFamily: 'monospace',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {value || '-'}
          </span>
        ),
      },
      {
        title: t('Body'),
        dataIndex: 'body',
        width: 300,
        render: this.renderBody,
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
      {
        title: t('Status'),
        dataIndex: 'claim_id',
        width: 120,
        render: this.renderClaimStatus,
      },
    ];
  }

  get searchFilters() {
    return [];
  }
}

export default inject('rootStore')(observer(MessageList));
