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
import { floatingIpStatus } from 'resources/neutron/floatingip';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { isNull } from 'lodash';
import { enablePFW } from 'resources/neutron/neutron';
import actionConfigs from '../actions';
import BaseDetail from './BaseDetail';
import PortForwarding from './PortForwarding';

export class FloatingIpDetail extends Base {
  get name() {
    return t('floating ip');
  }

  get policy() {
    return 'get_floatingip';
  }

  get listUrl() {
    return this.getRoutePath('fip');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Floating IP'),
        dataIndex: 'floating_ip_address',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: floatingIpStatus,
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
    if (enablePFW() && isNull(this.detailData.fixed_ip_address)) {
      tabs.push({
        title: t('Port Forwardings'),
        key: 'port_forwarding',
        component: PortForwarding,
      });
    }
    return tabs;
  }

  init() {
    this.store = new FloatingIpStore();
  }
}

export default inject('rootStore')(observer(FloatingIpDetail));
