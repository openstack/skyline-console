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

// import React from 'react';
import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import globalServicesStore from 'src/stores/zun/services';
import { serviceState } from 'resources/nova/service';
import { getOptions } from 'utils';

export class Services extends Base {
  init() {
    this.store = globalServicesStore;
    this.downloadStore = globalServicesStore;
  }

  get name() {
    return t('services');
  }

  get policy() {
    return 'zun-service:get_all';
  }

  getColumns() {
    return [
      {
        title: t('Name'),
        dataIndex: 'binary',
      },
      {
        title: t('Hosts'),
        dataIndex: 'host',
        isHideable: true,
      },
      {
        title: t('Availability Zone'),
        dataIndex: 'availability_zone',
        isHideable: true,
      },
      {
        title: t('Report Count'),
        dataIndex: 'report_count',
        isHideable: true,
      },
      {
        title: t('Forced Down'),
        dataIndex: 'forced_down',
        valueRender: 'yesNo',
        isHideable: true,
      },
      {
        title: t('Forbidden'),
        dataIndex: 'disabled',
        valueRender: 'yesNo',
        isHideable: true,
      },
      {
        title: t('Service State'),
        dataIndex: 'state',
        valueMap: serviceState,
      },
      {
        title: t('Last Updated'),
        dataIndex: 'updated_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'binary',
      },
      {
        label: t('Service State'),
        name: 'state',
        options: getOptions(serviceState),
      },
    ];
  }
}

export default inject('rootStore')(observer(Services));
