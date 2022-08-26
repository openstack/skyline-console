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

import React from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { portStatus } from 'resources/neutron/port';
import { PortStore } from 'stores/neutron/port';
import { getOptions } from 'utils';

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
    const { id } = this.props.match.params;
    const { tab, ...rest } = params;
    this.fetchListWithTry(async () => {
      await this.store.fetchList({ device_id: id, ...rest });
      this.list.silent = false;
    });
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('routerPortDetail'),
      routeParamsFunc: (data) => ({
        routerId: this.id,
        id: data.id,
      }),
    },
    {
      title: t('IP Address'),
      dataIndex: 'fixed_ips',
      isHideable: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return '-';
        }
        return value.map((it) => (
          <div key={it.ip_address}>{it.ip_address}</div>
        ));
      },
      stringify: (value) => {
        if (!value || value.length === 0) {
          return '-';
        }
        return value.map((it) => it.ip_address).join(',');
      },
    },
    {
      title: t('Mac Address'),
      dataIndex: 'mac_address',
      isHideable: true,
    },
    {
      // todo: associated resources: instance ,lb....
      title: t('Associated Resources'),
      dataIndex: 'device_owner',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: portStatus,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(portStatus),
      },
    ];
  }
}

export default inject('rootStore')(observer(Ports));
