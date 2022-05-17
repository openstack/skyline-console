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
import { PortForwardingStore } from 'stores/neutron/port-forwarding';
import actionConfigs from './actions';

export class PortForwarding extends Base {
  init() {
    this.store = new PortForwardingStore();
    this.downloadStore = new PortForwardingStore();
  }

  get policy() {
    return 'get_floatingip_port_forwarding';
  }

  get name() {
    return t('port forwardings');
  }

  updateFetchParamsByPage = (params) => {
    const { id, all_projects, ...rest } = params;
    return {
      fipId: id,
      fipInfo: this.props.detail,
      ...rest,
    };
  };

  get isFilterByBackend() {
    return true;
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => [
    {
      title: t('External Port'),
      dataIndex: 'external_port',
    },
    {
      title: t('Internal Ip Address'),
      dataIndex: 'internal_ip_address',
      isHideable: true,
    },
    {
      title: t('Internal Port'),
      dataIndex: 'internal_port',
      isHideable: true,
    },
    {
      title: t('Protocol'),
      dataIndex: 'protocol',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Protocol'),
        name: 'protocol',
        options: [
          {
            label: 'TCP',
            key: 'tcp',
          },
          {
            label: 'UDP',
            key: 'udp',
          },
        ],
      },
      {
        label: t('External Port'),
        name: 'external_port',
      },
    ];
  }
}

export default inject('rootStore')(observer(PortForwarding));
