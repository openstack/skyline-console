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
import { provisioningStatusCodes } from 'resources/octavia/lb';
import { ListenerStore } from 'stores/octavia/listener';
import { emptyActionConfig } from 'utils/constants';
import { actionConfigs, adminActions } from './Actions';

export class Listeners extends Base {
  init() {
    this.store = new ListenerStore();
    this.downloadStore = new ListenerStore();
  }

  updateFetchParamsByPage = (params) => {
    const { id, ...rest } = params;
    return {
      loadbalancer_id: id,
      ...rest,
    };
  };

  get policy() {
    return 'os_load-balancer_api:listener:get_all';
  }

  get name() {
    return t('listeners');
  }

  get id() {
    return this.params.id;
  }

  get isFilterByBackend() {
    return true;
  }

  get forceRefreshTopDetailWhenListRefresh() {
    return true;
  }

  get actionConfigs() {
    const { provisioning_status } = this.props.detail;
    if (provisioning_status !== 'ACTIVE') {
      return emptyActionConfig;
    }
    if (this.isAdminPage) {
      return adminActions;
    }
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('lbListenerDetail'),
      routeParamsFunc: (data) => {
        return {
          loadBalancerId: this.id,
          id: data.id,
        };
      },
    },
    {
      title: t('Status'),
      dataIndex: 'provisioning_status',
      valueMap: provisioningStatusCodes,
      isHideable: true,
    },
    {
      title: t('Protocol'),
      dataIndex: 'protocol',
      isHideable: true,
      render: (value) =>
        (value === 'TERMINATED_HTTPS' ? 'HTTPS' : value) || '-',
    },
    {
      title: t('Port'),
      dataIndex: 'protocol_port',
      isHideable: true,
    },
    {
      title: t('Max connect'),
      dataIndex: 'connection_limit',
    },
    {
      title: t('Admin State Up'),
      dataIndex: 'admin_state_up',
      render: (value) => (value ? t('On') : t('Off')),
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

export default inject('rootStore')(observer(Listeners));
