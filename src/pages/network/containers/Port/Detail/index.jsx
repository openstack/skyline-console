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
import { PortStore } from 'stores/neutron/port-extension';
import Base from 'containers/TabDetail';
import { networkStatus } from 'resources/neutron/network';
import FixedIPs from './FixedIPs';
import SecurityGroups from './SecurityGroups';
import AllowedAddressPair from './AllowedAddressPair';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class PortDetail extends Base {
  get name() {
    return t('port');
  }

  get policy() {
    return 'get_port';
  }

  get listUrl() {
    const { networkId, subnetId, instanceId } = this.params;
    if (this.isSubnetPortDetail) {
      return this.getRoutePath(
        'subnetDetail',
        { id: subnetId, networkId },
        { tab: 'ports' }
      );
    }
    if (this.isNetworkPortDetail) {
      return this.getRoutePath(
        'networkDetail',
        { id: networkId },
        { tab: 'ports' }
      );
    }
    if (this.isInstancePortDetail) {
      return this.getRoutePath(
        'instanceDetail',
        { id: instanceId },
        { tab: 'interface' }
      );
    }
    return this.getRoutePath('port');
  }

  get isSubnetPortDetail() {
    return this.path.includes('subnet');
  }

  get isNetworkPortDetail() {
    return this.path.includes('networks') && !this.isSubnetPortDetail;
  }

  get isInstancePortDetail() {
    return this.path.includes('instance');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.adminActions;
    }
    return actionConfigs.actionConfigs;
  }

  getActionData() {
    return this.detailData.itemInList || {};
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        // render: data => moment(data).format('YYYY-MM-DD HH:mm:ss'),
        valueRender: 'toLocalTime',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: networkStatus,
      },
      {
        title: t('Owned Network'),
        dataIndex: 'itemInList.network_name',
      },
      {
        title: t('Network ID'),
        dataIndex: 'network_id',
      },
      {
        title: t('Port Security Enabled'),
        dataIndex: 'port_security_enabled',
        valueRender: 'yesNo',
      },
      {
        title: t('Mac Address'),
        dataIndex: 'mac_address',
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
        title: t('Fixed IPs'),
        key: 'fixed_ips',
        component: FixedIPs,
      },
      {
        title: t('Security Groups'),
        key: 'security_groups',
        component: SecurityGroups,
      },
      {
        title: t('Allowed Address Pairs'),
        key: 'allowed_address_pair',
        component: AllowedAddressPair,
      },
    ];
    const { port_security_enabled } = this.detailData;
    if (!port_security_enabled) {
      return tabs.filter((it) => it.key !== 'security_groups');
    }
    return tabs;
  }

  init() {
    this.store = new PortStore();
  }
}

export default inject('rootStore')(observer(PortDetail));
