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
  provisioningStatusCodes,
  operatingStatusCodes,
} from 'resources/octavia/lb';
import globalPoolMemberStore from 'stores/octavia/pool-member';
import { idNameColumn } from 'utils/table';
import { actionConfigs, adminActions } from './Actions';

export class Members extends Base {
  init() {
    this.store = globalPoolMemberStore;
  }

  fetchData = async () => {
    const { default_pool_id } = this.props.detail;
    if (default_pool_id) {
      this.fetchListWithTry(async () => {
        await this.store.fetchList({ pool_id: default_pool_id });
        this.list.silent = false;
      });
    } else {
      this.list.data = [];
      this.list.isLoading = false;
    }
  };

  get policy() {
    return 'os_load-balancer_api:member:get_all';
  }

  get name() {
    return t('Members');
  }

  get id() {
    return this.params.id;
  }

  get forceRefreshTopDetailWhenListRefresh() {
    return true;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminActions;
    }
    return actionConfigs;
  }

  getColumns = () => [
    idNameColumn,
    {
      title: t('Provisioning Status'),
      dataIndex: 'provisioning_status',
      valueMap: provisioningStatusCodes,
      isHideable: true,
    },
    {
      title: t('Operating Status'),
      dataIndex: 'operating_status',
      valueMap: operatingStatusCodes,
      isHideable: true,
    },
    {
      title: t('Admin State Up'),
      dataIndex: 'admin_state_up',
      render: (value) => (value ? t('On') : t('Off')),
      isStatus: false,
      isHideable: true,
    },
    {
      title: t('Ip Address'),
      dataIndex: 'address',
      isHideable: true,
    },
    {
      title: t('Port'),
      dataIndex: 'protocol_port',
      isHideable: true,
    },
    {
      title: t('Weight'),
      dataIndex: 'weight',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Members));
