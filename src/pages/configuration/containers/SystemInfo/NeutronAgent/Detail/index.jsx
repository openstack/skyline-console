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
import { NeutronAgentStore } from 'stores/neutron/agent';
import Base from 'containers/TabDetail';
import {
  getNeutronAgentServiceState,
  getNeutronAgentServiceStatus,
} from 'resources/nova/service';
import BaseDetail from './BaseDetail';
import Router from './Router';
import Network from './Network';
import actionConfigs from '../actions';

export class KeypairDetail extends Base {
  get name() {
    return t('neutron agent');
  }

  get policy() {
    return 'get_agent';
  }

  get listUrl() {
    return this.getRoutePath('systemInfo', null, { tab: 'neutronAgent' });
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Type'),
        dataIndex: 'agent_type',
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
      },
      {
        title: t('Host'),
        dataIndex: 'host',
      },
      {
        title: t('Availability Zone'),
        dataIndex: 'availability_zone',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
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
    if (this.detailData.agent_type === 'L3 agent') {
      tabs.push({
        title: t('Routers'),
        key: 'router',
        component: Router,
      });
    } else if (this.detailData.agent_type === 'DHCP agent') {
      tabs.push({
        title: t('Networks'),
        key: 'network',
        component: Network,
      });
    }
    return tabs;
  }

  init() {
    this.store = new NeutronAgentStore();
  }
}

export default inject('rootStore')(observer(KeypairDetail));
