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
import { ListenerStore } from 'stores/octavia/listener';
import Base from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import Members from './Member';
import { actionConfigs, adminActions } from '../Actions';

@inject('rootStore')
@observer
export default class ListenerDetail extends Base {
  get name() {
    return t('listener');
  }

  get policy() {
    return 'os_load-balancer_api:listener:get_one';
  }

  get listUrl() {
    const { loadBalancerId } = this.params;
    return `/network/${this.getUrl('load-balancers')}/detail/${loadBalancerId}`;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminActions;
    }
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Listener Name'),
        dataIndex: 'name',
      },
      {
        title: t('Protocol Type'),
        dataIndex: 'protocol',
      },
      {
        title: t('Port'),
        dataIndex: 'protocol_port',
      },
      {
        title: t('Status'),
        dataIndex: 'provisioning_status',
      },
      {
        title: t('Max connect'),
        dataIndex: 'connection_limit',
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
      {
        title: t('Member'),
        key: 'members',
        component: Members,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new ListenerStore();
  }
}
