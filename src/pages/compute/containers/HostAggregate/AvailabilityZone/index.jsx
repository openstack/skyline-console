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
import globalAvailabilityZoneStore from 'stores/nova/zone';

export class AvailabilityZone extends Base {
  init() {
    this.store = globalAvailabilityZoneStore;
  }

  get policy() {
    return 'os_compute_api:os-availability-zone:detail';
  }

  get name() {
    return t('availability zones');
  }

  get rowKey() {
    return 'zoneName';
  }

  get hasTab() {
    return true;
  }

  getColumns = () => [
    {
      title: t('Availability Zone Name'),
      dataIndex: 'zoneName',
    },
    {
      title: t('Hosts'),
      dataIndex: 'hosts',
      isHideable: true,
      render: (value) => {
        if (!value || isEmpty(value)) {
          return '-';
        }
        return Object.keys(value).map((key) => <div key={key}>{key}</div>);
      },
      stringify: (value) => {
        if (!value || isEmpty(value)) {
          return '-';
        }
        return Object.keys(value);
      },
    },
    {
      title: t('Available'),
      dataIndex: 'available',
      isHideable: true,
      valueRender: 'yesNo',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Availability Zone Name'),
        name: 'zoneName',
      },
    ];
  }
}

export default inject('rootStore')(observer(AvailabilityZone));
