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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { serviceStatus, serviceState } from 'resources/nova/service';
import globalComputeHostStore from 'stores/nova/compute-host';
import { getOptions } from 'utils';
import actionConfigs from './actions';

export class ComputeHost extends Base {
  init() {
    this.store = globalComputeHostStore;
  }

  get policy() {
    return 'os_compute_api:os-services:list';
  }

  get name() {
    return t('compute hosts');
  }

  get hasTab() {
    return true;
  }

  get fetchDataByAllProjects() {
    return false;
  }

  updateFetchParams = (params) => ({
    ...params,
    binary: 'nova-compute',
  });

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Host'),
      dataIndex: 'host',
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'zone',
    },
    {
      title: t('Service Status'),
      dataIndex: 'status',
      valueMap: serviceStatus,
      tip: (value, record) => {
        const { disabled_reason } = record || {};
        if (disabled_reason) {
          return `${t('Reason: ')} ${disabled_reason}`;
        }
        return '';
      },
    },
    {
      title: t('Service State'),
      dataIndex: 'state',
      valueMap: serviceState,
    },
    {
      title: t('Last Updated'),
      dataIndex: 'updated_at',
      valueRender: 'sinceTime',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Host'),
        name: 'host',
      },
      {
        label: t('Service Status'),
        name: 'status',
        options: getOptions(serviceStatus),
      },
      {
        label: t('Service State'),
        name: 'state',
        options: getOptions(serviceState),
      },
    ];
  }
}

export default inject('rootStore')(observer(ComputeHost));
