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
import { IronicStore } from 'stores/ironic/ironic';
import Base from 'containers/TabDetail';
// import Members from 'pages/compute/containers/Instance';
import { powerState, provisioningState } from 'resources/ironic/ironic';
import BaseDetail from './BaseDetail';
import Port from './Port';
import PortGroup from './PortGroup';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('bare metal node');
  }

  get policy() {
    return 'baremetal:node:get';
  }

  get listUrl() {
    return this.getRoutePath('baremetalNode');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Node Name'),
        dataIndex: 'name',
      },
      {
        title: t('Ironic Instance Name'),
        dataIndex: 'instance_info.display_name',
      },
      {
        title: t('Power State'),
        dataIndex: 'power_state',
        valueMap: powerState,
      },
      {
        title: t('Provision State'),
        dataIndex: 'provision_state',
        valueMap: provisioningState,
      },
      {
        title: t('Maintained'),
        dataIndex: 'maintenance',
        valueRender: 'yesNo',
        tip: (value, record) => record.maintenance_reason,
      },
      {
        title: t('Number of Ports'),
        dataIndex: 'portsNew',
        render: (value) => (value && value.length) || '-',
      },
      {
        title: t('Driver'),
        dataIndex: 'driver',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Base Info'),
        key: 'base',
        component: BaseDetail,
      },
      {
        title: t('Ports'),
        key: 'ports',
        component: Port,
      },
      {
        title: t('Port Groups'),
        key: 'portGroups',
        component: PortGroup,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new IronicStore();
  }
}

export default inject('rootStore')(observer(Detail));
