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
import { VpnIPsecConnectionStore } from 'stores/neutron/vpn-ipsec-connection';
import { vpnStatus } from 'resources/neutron/vpn';
import BaseDetail from './BaseDetail';
import { actionConfigs, adminConfigs } from '../actions';

export class IPsecSiteConnection extends Base {
  init() {
    this.store = new VpnIPsecConnectionStore();
  }

  get name() {
    return t('IPsec Site Connection');
  }

  get policy() {
    return 'get_ipsec_site_connection';
  }

  get listUrl() {
    return this.getRoutePath('vpn', null, { tab: 'ipsec_site_connections' });
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminConfigs;
    }
    return actionConfigs;
  }

  get detailInfos() {
    const ret = [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
        hidden: !this.isAdminPage,
      },
      {
        title: t('VPN Service ID'),
        dataIndex: 'vpnservice_id',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: vpnStatus,
      },
      {
        title: t('Local Endpoint Group ID'),
        dataIndex: 'local_ep_group_id',
      },
      {
        title: t('Peer Endpoint Group ID'),
        dataIndex: 'peer_ep_group_id',
      },
      {
        title: t('Peer Address'),
        dataIndex: 'peer_address',
      },
      {
        title: t('Peer ID'),
        dataIndex: 'peer_id',
      },
      {
        title: t('Admin State'),
        dataIndex: 'admin_state_up',
        valueRender: 'yesNo',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
    return ret;
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
}

export default inject('rootStore')(observer(IPsecSiteConnection));
