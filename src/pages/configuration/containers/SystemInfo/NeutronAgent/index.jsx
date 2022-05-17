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
import {
  getNeutronAgentServiceState,
  getNeutronAgentServiceStatus,
} from 'resources/nova/service';
import globalNeutronAgentStore from 'stores/neutron/agent';
import actionConfigs from './actions';

export class NeutronAgent extends Base {
  init() {
    this.store = globalNeutronAgentStore;
  }

  get policy() {
    return 'get_agent';
  }

  get name() {
    return t('neutron agents');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'binary',
      isLink: true,
      routeName: 'neutronAgentDetailAdmin',
    },
    {
      title: t('Type'),
      dataIndex: 'agent_type',
      isHideable: true,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
      render: (value) => value || '-',
    },
    {
      title: t('Service Status'),
      dataIndex: 'admin_state_up',
      render: (value) => getNeutronAgentServiceStatus(value) || '-',
    },
    {
      title: t('Service State'),
      dataIndex: 'alive',
      render: (value) => getNeutronAgentServiceState(value) || '-',
      isStatus: true,
    },
    {
      title: t('Last Updated'),
      dataIndex: 'heartbeat_timestamp',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'binary',
      },
      {
        label: t('Service Status'),
        name: 'admin_state_up',
        options: [true, false].map((key) => ({
          label: getNeutronAgentServiceStatus(key),
          key,
        })),
      },
      {
        label: t('Service State'),
        name: 'alive',
        options: [true, false].map((key) => ({
          label: getNeutronAgentServiceState(key),
          key,
        })),
      },
    ];
  }
}

export default inject('rootStore')(observer(NeutronAgent));
