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

import Base from 'containers/BaseDetail';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Row, Col } from 'antd';
import { stringifyContent } from 'utils/content';

export class BaseDetail extends Base {
  get leftCards() {
    const { containers = [] } = this.detailData;
    const cards = [this.baseInfoCard];
    if (containers.length) {
      cards.push(this.containersCard);
    }
    return cards;
  }

  get rightCards() {
    return [this.specCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Status Reason'),
        dataIndex: 'status_reason',
      },
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        label: t('User ID'),
        dataIndex: 'user_id',
      },
    ];

    return {
      title: t('Capsule Type'),
      options,
    };
  }

  get containersCard() {
    const options = [
      {
        label: t('Containers'),
        dataIndex: 'containers',
        render: (value) =>
          value.map((it) => {
            return (
              <Row key={it.uuid}>
                <Col style={{ marginRight: 8 }}>{t('ID/Name')}:</Col>
                <Col>
                  <p>{it.name}</p>
                  <p>{it.uuid}</p>
                </Col>
              </Row>
            );
          }),
      },
    ];

    return {
      title: t('Containers Info'),
      options,
      labelCol: 0,
      contentCol: 24,
    };
  }

  get specCard() {
    const options = [
      {
        label: t('CPU'),
        dataIndex: 'cpu',
      },
      {
        label: t('Memory (MiB)'),
        dataIndex: 'memory',
      },
      {
        label: t('Exit Policy'),
        dataIndex: 'restart_policy',
      },
      {
        label: t('Addresses'),
        dataIndex: 'addresses',
        render: stringifyContent,
      },
    ];

    return {
      title: t('Spec'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
