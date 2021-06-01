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
import Base from 'containers/List';
import { LbaasStore } from 'stores/octavia/loadbalancer';
import { lbEndpoint } from 'utils/constants';
import { actionConfigs, adminActions } from './actions';

@inject('rootStore')
@observer
export default class LoadBalancerInstance extends Base {
  init() {
    this.store = new LbaasStore();
    this.downloadStore = new LbaasStore();
  }

  fetchDataByPage = async (params) => {
    await this.store.fetchListByPageWithFip(params);
    this.list.silent = false;
  };

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return true;
  }

  get policy() {
    return 'os_load-balancer_api:loadbalancer:get_all';
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return lbEndpoint();
  }

  get name() {
    return t('Load Balancers');
  }

  get isFilterByBackend() {
    return true;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminActions;
    }
    return actionConfigs;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns = () => {
    const ret = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        isName: true,
        linkPrefix: `/network/${this.getUrl('load-balancers')}/detail/`,
        idKey: 'id',
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        sortKey: 'project_id',
      },
      {
        title: t('Network ID'),
        dataIndex: 'vip_network_id',
      },
      {
        title: t('IP'),
        dataIndex: 'vip_address',
      },
      {
        title: t('Floating IP'),
        dataIndex: 'fip',
        render: (t) => t || '-',
      },
      {
        title: t('Port ID'),
        dataIndex: 'vip_port_id',
      },
      {
        title: t('Operating Status'),
        dataIndex: 'operating_status',
      },
      {
        title: t('Provisioning Status'),
        dataIndex: 'provisioning_status',
      },
      {
        title: t('Listener Number'),
        dataIndex: 'listeners',
        render: (t) => t.length,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
        isHideable: true,
      },
    ];
    return ret;
  };

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}
