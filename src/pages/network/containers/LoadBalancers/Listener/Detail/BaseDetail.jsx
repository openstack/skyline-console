// Copyright 2021 99cloud
//
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
import Base from 'containers/BaseDetail';
import { getInsertHeaderCard } from 'resources/octavia/lb';
import { isEmpty } from 'lodash';
import { algorithmDict } from 'resources/octavia/pool';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.poolCard];
    const { insert_headers = {}, default_pool_id } = this.detailData;
    if (default_pool_id) {
      cards.push(this.healthMonitor);
    }
    if (!isEmpty(insert_headers)) {
      cards.push(this.customHeaders);
    }
    return cards;
  }

  get rightCards() {
    const { protocol } = this.detailData || {};
    if (protocol === 'TERMINATED_HTTPS' && !this.isAdminPage) {
      return [this.certificateInfo];
    }
    return [];
  }

  get poolCard() {
    const { default_pool = {}, default_pool_id } = this.detailData || {};
    const { name, protocol, lb_algorithm, description, admin_state_up } =
      default_pool;
    const options = !default_pool_id
      ? [
          {
            label: '',
            content: t('No default pool set'),
          },
        ]
      : [
          {
            label: t('Name'),
            content: name || '-',
          },
          {
            label: t('Protocol'),
            content: protocol || '-',
          },
          {
            label: t('LB Algorithm'),
            content: algorithmDict[lb_algorithm] || lb_algorithm || '-',
          },
          {
            label: t('Admin State Up'),
            content: admin_state_up ? t('On') : t('Off'),
          },
          {
            label: t('Description'),
            content: description || '-',
          },
        ];
    return {
      title: t('Pool Info'),
      options,
    };
  }

  get customHeaders() {
    const { insert_headers = {} } = this.detailData || {};
    return getInsertHeaderCard(insert_headers || {});
  }

  get healthMonitor() {
    const healthMonitor = this.detailData.healthMonitor || {};
    const { type, delay, timeout, max_retries, admin_state_up, url_path } =
      healthMonitor;
    const options = [
      {
        label: t('Enable Health Monitor'),
        content: !isEmpty(healthMonitor) ? t('Yes') : t('No'),
      },
    ];
    if (!isEmpty(healthMonitor)) {
      options.push(
        ...[
          {
            label: t('Health Monitor Type'),
            content: type,
          },
          {
            label: t('Delay Interval(s)'),
            content: delay,
          },
          {
            label: t('Timeout(s)'),
            content: timeout,
          },
          {
            label: t('Max Retries'),
            content: max_retries,
          },
          {
            label: t('Admin State Up'),
            content: admin_state_up ? t('On') : t('Off'),
          },
          {
            label: t('Monitoring URL'),
            content: url_path || '/',
          },
        ]
      );
    }
    return {
      title: t('Health Monitor'),
      options,
    };
  }

  get certificateInfo() {
    const options = [
      {
        label: t('Server Certificate'),
        dataIndex: 'serverCertificateId',
        render: (value) => {
          return value
            ? this.getLinkRender(
                'certificateContainerDetail',
                value,
                {
                  id: value,
                },
                null
              )
            : '-';
        },
      },
      {
        label: t('CA Certificate'),
        dataIndex: 'caCertificateId',
        render: (value) => {
          return value
            ? this.getLinkRender(
                'certificateSecretDetail',
                value,
                {
                  id: value,
                },
                null
              )
            : '-';
        },
      },
      {
        label: t('SNI Certificate'),
        dataIndex: 'sniCertificateId',
        render: (value) => {
          return value.length
            ? value.map(
                (it, index) =>
                  this.getLinkRender(
                    'certificateContainerDetail',
                    `${it}${index === value.length - 1 ? '' : ' , '}`,
                    {
                      id: it,
                    }
                  ),
                null
              )
            : '-';
        },
      },
    ];
    return {
      title: t('certificate'),
      options,
      labelCol: 4,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
