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
import { PortStore } from 'stores/neutron/port';
import Base from 'containers/TabDetail';
import { portStatus } from 'resources/neutron/port';
import BaseDetail from './BaseDetail';

export class PortDetail extends Base {
  get name() {
    return t('port');
  }

  get policy() {
    return 'get_port';
  }

  get listUrl() {
    const { routerId } = this.params;
    return this.getRoutePath(
      'routerDetail',
      { id: routerId },
      { tab: 'interfaces' }
    );
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
        valueMap: portStatus,
      },
      {
        title: t('Project ID'),
        dataIndex: 'tenant_id',
        hidden: !this.isAdminPage,
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
    ];
    return tabs;
  }

  init() {
    this.store = new PortStore();
  }
}

export default inject('rootStore')(observer(PortDetail));
