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

import React from 'react';
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import { InstanceStatus, policyType } from 'resources/trove/database';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.specsCard, this.connectionInfoCard];
  }

  get rightCards() {
    return [this.faultCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Name'),
        dataIndex: 'name',
      },
      {
        label: t('Datastore'),
        dataIndex: 'type',
      },
      {
        label: t('Datastore Version'),
        dataIndex: 'version',
      },
      {
        label: t('Status'),
        dataIndex: 'status',
        valueMap: InstanceStatus,
      },
      {
        label: t('Locality'),
        dataIndex: 'locality',
        valueMap: policyType,
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get specsCard() {
    const options = [
      {
        label: t('Database Flavor'),
        dataIndex: 'flavor',
        render: (value) => {
          return this.getLinkRender(
            'flavorDetail',
            value.name,
            {
              id: value.id,
            },
            null
          );
        },
      },
      {
        label: t('Volume Size'),
        dataIndex: 'size',
        unit: 'GiB',
      },
      {
        label: t('Created At'),
        dataIndex: 'created',
        valueRender: 'toLocalTime',
      },
      {
        label: t('Updated At'),
        dataIndex: 'updated',
        valueRender: 'toLocalTime',
      },
      {
        label: t('Service Status Updated'),
        dataIndex: 'service_status_update',
      },
    ];

    return {
      title: t('Specs'),
      options,
    };
  }

  get connectionInfoCard() {
    const options = [
      {
        label: t('Host'),
        dataIndex: 'ip',
        render: (value) => {
          return value && value.length ? (
            <span>
              {value.map((it) => (
                <div key={it}>{it}</div>
              ))}
            </span>
          ) : (
            '-'
          );
        },
      },
      {
        label: t('Database Port'),
        dataIndex: 'type',
        render: (value) => {
          switch (value) {
            case 'mysql':
              return '3306';
            case 'mongodb':
              return '27017';
            case 'postgresql':
              return '5432';
            default:
              break;
          }
        },
      },
      {
        label: t('Connection Examples'),
        dataIndex: 'connection_examples',
      },
    ];

    return {
      title: t('Connection Information'),
      options,
    };
  }

  get faultCard() {
    const options = [
      {
        label: t('Created At'),
        dataIndex: 'created',
        valueRender: 'toLocalTime',
      },
      {
        label: t('Message'),
        dataIndex: 'fault.message',
      },
      {
        label: t('Message Details'),
        dataIndex: 'fault.details',
      },
    ];

    return {
      title: t('Fault'),
      labelCol: 2,
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
