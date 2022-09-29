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
import { VpnIPsecConnectionStore } from 'stores/neutron/vpn-ipsec-connection';
import { vpnStatus, vpnStatusOptions } from 'resources/neutron/vpn';
import { actionConfigs, adminConfigs } from './actions';

export class IPsecSiteConnection extends Base {
  init() {
    this.store = new VpnIPsecConnectionStore();
    this.downloadStore = new VpnIPsecConnectionStore();
  }

  get isFilterByBackend() {
    return true;
  }

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return true;
  }

  get policy() {
    return 'get_ipsec_site_connection';
  }

  get name() {
    return t('ipsec site connection');
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminConfigs;
    }
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('ipsecDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      hidden: !this.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
      isHideable: true,
    },
    {
      title: t('Local Endpoint Group ID'),
      dataIndex: 'local_ep_group_id',
      isHideable: true,
    },
    {
      title: t('Peer Endpoint Group ID'),
      dataIndex: 'peer_ep_group_id',
      isHideable: true,
    },
    {
      title: t('Peer Address'),
      dataIndex: 'peer_address',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: vpnStatus,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Local Endpoint Group ID'),
        name: 'local_ep_group_id',
      },
      {
        label: t('Peer Endpoint Group ID'),
        name: 'peer_ep_group_id',
      },
      {
        label: t('Peer Address'),
        name: 'peer_address',
      },
      {
        label: t('Status'),
        name: 'status',
        options: vpnStatusOptions,
      },
    ];
  }
}

export default inject('rootStore')(observer(IPsecSiteConnection));
