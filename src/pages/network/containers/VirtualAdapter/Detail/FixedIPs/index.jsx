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
import { FixedIpStore } from 'stores/neutron/fixed-ip';
import actionConfigs from './actions';

export class FixedIP extends Base {
  init() {
    this.store = new FixedIpStore();
    this.downloadStore = new FixedIpStore();
  }

  get rowKey() {
    return 'ip_address';
  }

  get policy() {
    return 'get_port';
  }

  get name() {
    return t('Fixed IP');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.adminConfigs;
    }
    return actionConfigs.actionConfigs;
  }

  get hideCustom() {
    return true;
  }

  getColumns = () => [
    {
      title: t('IP Address'),
      dataIndex: 'ip_address',
    },
    {
      title: t('Floating IP'),
      dataIndex: 'fip',
      render: (fip) => {
        if (fip.length === 0) {
          return '-';
        }
        return fip[0].floating_ip_address;
      },
    },
    {
      title: t('Owned Subnet'),
      dataIndex: 'subnet',
      render: (value) => (value && value.name) || '-',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('IP Address'),
        name: 'ip_address',
      },
      {
        label: t('Owned Subnet'),
        name: 'subnet',
        filterFunc: (record, val) => record.name === val,
      },
    ];
  }
}

export default inject('rootStore')(observer(FixedIP));
