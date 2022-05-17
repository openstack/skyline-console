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
import { IronicPortGroupStore } from 'stores/ironic/port-group';
import actionConfigs from './actions';

export class BareMetalNodePortGroup extends Base {
  init() {
    this.store = new IronicPortGroupStore();
  }

  get policy() {
    return 'baremetal:portgroup:get';
  }

  get name() {
    return t('port groups');
  }

  get rowKey() {
    return 'uuid';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'uuid',
    },
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Mac Address'),
      dataIndex: 'address',
    },
    {
      title: t('Stand Alone Ports Supported'),
      dataIndex: 'standalone_ports_supported',
      valueRender: 'yesNo',
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [];
  }

  updateFetchParams = (params) => {
    const { all_projects, ...rest } = params;
    return rest;
  };
}

export default inject('rootStore')(observer(BareMetalNodePortGroup));
