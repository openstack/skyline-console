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
import { tableFilter } from 'resources/neutron/firewall-port';
import { PortStore } from 'stores/neutron/port';
import { portStatus } from 'resources/neutron/port';

export class Ports extends Base {
  init() {
    this.store = new PortStore();
  }

  get policy() {
    return 'get_port';
  }

  get name() {
    return t('ports');
  }

  get id() {
    return this.params.id;
  }

  async getData({ silent, ...params } = {}) {
    silent && (this.list.silent = true);
    const { tab, ...rest } = params;
    const { detail: { ports = [] } = {} } = this.props;
    const newParams = { ports, ...rest };
    if (this.isAdminPage) {
      newParams.all_projects = true;
    }
    this.fetchListWithTry(async () => {
      await this.store.fetchListByFirewall(newParams);
      this.list.silent = false;
    });
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      width: 150,
      isLink: true,
      routeName: this.getRouteName('firewallPortDetail'),
      routeParamsFunc: (data) => ({
        firewallId: this.id,
        portId: data.id,
      }),
    },
    {
      title: t('Network ID/Name'),
      dataIndex: 'network.name',
      isLink: true,
      routeName: this.getRouteName('networkDetail'),
      idKey: 'network.id',
    },
    {
      title: t('Owner'),
      dataIndex: 'owner',
      isHideable: true,
    },
    {
      title: t('Device ID/Name'),
      dataIndex: 'router.name',
      isLink: true,
      routeName: this.getRouteName('routerDetail'),
      idKey: 'router.id',
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: portStatus,
    },
  ];

  get searchFilters() {
    return tableFilter;
  }
}

export default inject('rootStore')(observer(Ports));
