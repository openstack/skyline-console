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
import Base from 'containers/TabDetail';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import FloatingIp from 'pages/network/containers/FloatingIp';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class QoSPolicyDetail extends Base {
  get name() {
    return t('qoS policy');
  }

  get policy() {
    return 'get_policy';
  }

  get aliasPolicy() {
    return 'neutron:get_policy';
  }

  get listUrl() {
    return this.getRoutePath('networkQos');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigs;
    }
    return actionConfigs.consoleActions;
  }

  get detailInfos() {
    const ret = [
      {
        title: t('Policy Name'),
        dataIndex: 'name',
      },
      {
        title: t('Rule Numbers'),
        dataIndex: 'rules',
        render: (rules) => rules.length,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Shared'),
        dataIndex: 'shared',
        valueRender: 'yesNo',
      },
      {
        title: t('Default Policy'),
        dataIndex: 'is_default',
        valueRender: 'yesNo',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
    if (this.isAdminPage) {
      ret.splice(3, 0, {
        title: t('Owned Project'),
        dataIndex: 'project_name',
      });
    }
    return ret;
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
      {
        title: t('Floating IPs'),
        key: 'fip',
        component: FloatingIp,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new QoSPolicyStore();
  }
}

export default inject('rootStore')(observer(QoSPolicyDetail));
