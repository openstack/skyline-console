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
import globalStaticRouteStore from 'stores/neutron/static-route';
import actionConfigs from './actions';

export class StaticRouters extends Base {
  init() {
    this.store = globalStaticRouteStore;
  }

  get policy() {
    return 'get_router';
  }

  get name() {
    return t('static routers');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Destination CIDR'),
      dataIndex: 'destination',
    },
    {
      title: t('Next Hop'),
      dataIndex: 'nexthop',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [];
  }
}

export default inject('rootStore')(observer(StaticRouters));
