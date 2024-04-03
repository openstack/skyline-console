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
import Base from 'containers/BaseDetail';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard];
    return cards;
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('UUID'),
        dataIndex: 'uuid',
      },
      {
        label: t('Failover Segment'),
        dataIndex: 'failover_segment_id',
        render: (value, row) => {
          return (
            <Link
              to={this.getRoutePath('masakariSegmentDetail', {
                id: row.failover_segment_id,
              })}
            >
              {row.failover_segment.name}
            </Link>
          );
        },
      },
      {
        label: t('Reserved'),
        dataIndex: 'reserved',
        valueRender: 'yesNo',
      },
      {
        label: t('On Maintenance'),
        dataIndex: 'on_maintenance',
        valueRender: 'yesNo',
      },
      {
        label: t('Type'),
        dataIndex: 'type',
      },
      {
        label: t('Control Attribute'),
        dataIndex: 'control_attributes',
      },
    ];

    return {
      title: t('Host Detail'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
