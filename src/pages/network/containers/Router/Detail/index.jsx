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

import { inject, observer } from 'mobx-react';
import { RouterStore } from 'stores/neutron/router';
import Base from 'containers/TabDetail';
import { routerStatus, getRouterState } from 'resources/neutron/router';
import BaseDetail from './BaseDetail';
import Port from '../Port';
import StaticRouter from '../StaticRouter';
import actionConfigs from '../actions';

export class RouterDetail extends Base {
  get name() {
    return t('router');
  }

  get policy() {
    return 'get_router';
  }

  get listUrl() {
    return this.getRoutePath('router');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: routerStatus,
      },
      {
        title: t('Admin State'),
        dataIndex: 'admin_state_up',
        render: (data) => getRouterState(data) || '-',
      },
      {
        title: t('Project ID'),
        dataIndex: 'tenant_id',
        hidden: !this.isAdminPage,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
      {
        title: t('Ports'),
        key: 'ports',
        component: Port,
      },
      {
        title: t('Static Routes'),
        key: 'staticRoutes',
        component: StaticRouter,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new RouterStore();
  }
}

export default inject('rootStore')(observer(RouterDetail));
