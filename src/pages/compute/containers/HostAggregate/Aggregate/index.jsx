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
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { isEmpty } from 'lodash';
import globalAggregateStore from 'stores/nova/aggregate';
import actionConfigs from './actions';

export class HostAggregate extends Base {
  init() {
    this.store = globalAggregateStore;
  }

  get policy() {
    return 'os_compute_api:os-aggregates:index';
  }

  get name() {
    return t('host aggregates');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
      isHideable: true,
    },
    {
      title: t('Hosts'),
      dataIndex: 'hosts',
      isHideable: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return '-';
        }
        return value.map((item) => <div key={item}>{item}</div>);
      },
    },
    {
      title: t('Metadata'),
      dataIndex: 'metadata',
      isHideable: true,
      render: (value) => {
        if (!value || isEmpty(value)) {
          return '-';
        }
        return Object.keys(value).map((key) => (
          <div key={key}>
            {key}={value[key]}
          </div>
        ));
      },
      stringify: (value) => {
        if (!value || isEmpty(value)) {
          return '-';
        }
        return Object.keys(value)
          .map((key) => `${key}=${value[key]}`)
          .join(';');
      },
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'sinceTime',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(HostAggregate));
