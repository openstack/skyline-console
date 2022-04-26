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
import globalShareNetworkStore from 'stores/manila/share-network';
import PopoverSubnets from 'components/Popover/PopoverSubnets';
import PopoverNetworks from 'components/Popover/PopoverNetworks';
import actionConfigs from './actions';

export class ShareNetwork extends Base {
  init() {
    this.store = globalShareNetworkStore;
  }

  get policy() {
    return 'manila:share_network:detail';
  }

  get name() {
    return t('share types');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('shareNetworkDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
    },
    {
      title: t('Neutron Net'),
      dataIndex: 'networks',
      render: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        const links = subnets.map((it) => {
          const { neutron_net_id: id } = it;
          const link = this.getLinkRender('networkDetail', id, { id });
          return <div key={it.id}>{link}</div>;
        });
        const networkIds = subnets.map((it) => it.neutron_net_id);
        return (
          <>
            {links} <PopoverNetworks networkIds={networkIds} />
          </>
        );
      },
      stringify: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        return (subnets || []).map((it) => it.neutron_net_id).join(', ');
      },
    },
    {
      title: t('Neutron Subnet'),
      dataIndex: 'share_network_subnets',
      render: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        const idItems = subnets.map((it) => {
          const { neutron_subnet_id } = it;
          return <div key={it.id}>{neutron_subnet_id}</div>;
        });
        const ids = subnets.map((it) => it.neutron_subnet_id);
        return (
          <>
            {idItems} <PopoverSubnets subnetIds={ids} />
          </>
        );
      },
      stringify: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        return (subnets || []).map((it) => it.neutron_subnet_id).join(', ');
      },
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];
}

export default inject('rootStore')(observer(ShareNetwork));
