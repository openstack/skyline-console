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
import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import globalHostStore, { HostStore } from 'stores/masakari/hosts';
import { Link } from 'react-router-dom';

export class HostDetail extends Base {
  init() {
    this.store = globalHostStore;
    this.downloadStore = new HostStore();
  }

  get policy() {
    return 'volume:get_all';
  }

  get name() {
    return t('Host');
  }

  getColumns = () => {
    const columns = [
      {
        title: t('Name'),
        dataIndex: 'name',
        render: (value, row) => {
          const path = this.getRoutePath(
            'masakariHostDetail',
            { id: row.failover_segment_id },
            { uuid: row.uuid }
          );
          return <Link to={path}>{value}</Link>;
        },
      },
      {
        title: t('UUID'),
        dataIndex: 'uuid',
        isHideable: true,
      },
      {
        title: t('Reserved'),
        dataIndex: 'reserved',
        isHideable: true,
        valueRender: 'yesNo',
      },
      {
        title: t('Type'),
        dataIndex: 'type',
        isHideable: true,
      },
      {
        title: t('Control Attribute'),
        dataIndex: 'control_attributes',
        isHideable: true,
      },
      {
        title: t('On Maintenance'),
        dataIndex: 'on_maintenance',
        isHideable: true,
        valueRender: 'yesNo',
      },
      {
        title: t('Failover Segment'),
        dataIndex: 'failover_segment',
        isHideable: true,
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
    ];
    return columns;
  };
}

export default inject('rootStore')(observer(HostDetail));
