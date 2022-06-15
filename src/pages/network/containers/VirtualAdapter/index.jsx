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
import { VirtualAdapterStore } from 'stores/neutron/virtual-adapter';
import { portStatus } from 'resources/neutron/port';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class VirtualAdapter extends Base {
  init() {
    this.store = new VirtualAdapterStore();
    this.downloadStore = new VirtualAdapterStore();
  }

  get isInstanceDetail() {
    return (
      this.inDetailPage &&
      (this.path.includes('compute/instance') ||
        this.path.includes('management/recycle-bin'))
    );
  }

  get isNetworkDetail() {
    return (
      this.inDetailPage &&
      (this.path.includes('networks/detail') ||
        this.path.includes('networks-admin/detail'))
    );
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'status';
  }

  updateFetchParamsByPage = (params) => {
    const { id, ...rest } = params;
    const newParams = { ...rest };
    if (this.isInstanceDetail) {
      newParams.device_id = id;
    } else if (this.isNetworkDetail) {
      newParams.network_id = id;
    } else {
      newParams.device_owner = ['compute:nova', ''];
    }
    return newParams;
  };

  get policy() {
    return 'get_port';
  }

  get name() {
    return t('virtual adapters');
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get isRecycleBinDetail() {
    return this.inDetailPage && this.path.includes('recycle-bin');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    if (this.isAdminPage) {
      return actionConfigs.adminActions;
    }
    if (this.inDetailPage) {
      if (this.isInstanceDetail) {
        return actionConfigs.actionConfigsInDetail;
      }
      return actionConfigs.noActions;
    }
    return actionConfigs.actionConfigs;
  }

  // get hideCustom () {
  //   return true;
  // }

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('virtualAdapterDetail'),
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        isHideable: true,
        sortKey: 'project_id',
      },
      {
        title: t('Bind Resource'),
        dataIndex: 'server_name',
        stringify: (server_name, item) => {
          if (item.device_id && item.device_owner === 'compute:nova') {
            return `${item.device_owner} \n ${item.device_id} (${server_name})`;
          }
          return `
            ${item.device_owner} ${item.device_owner && `\n`}
            ${item.device_id || '-'}
          `;
        },
        render: (server_name, item) => {
          const { device_id, device_owner } = item;
          if (device_id && device_owner === 'compute:nova') {
            const value = server_name
              ? `${device_id} (${server_name})`
              : device_id;
            const link = this.getLinkRender(
              'instanceDetail',
              value,
              { id: item.device_id },
              { tab: 'interface' }
            );
            return (
              <>
                {item.device_owner}
                <br />
                {link}
              </>
            );
          }
          return (
            <>
              {item.device_owner}
              {item.device_owner && <br />}
              {item.device_id || '-'}
            </>
          );
        },
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Owned Network'),
        dataIndex: 'network_name',
        isLink: true,
        routeName: this.getRouteName('networkDetail'),
        idKey: 'network_id',
        sorter: false,
      },
      {
        title: t('IPv4 Address'),
        dataIndex: 'ipv4',
        render: (value) => value.map((it) => <div key={it}>{it}</div>),
        isHideable: true,
        stringify: (value) => value.join(','),
        sorter: false,
      },
      {
        title: t('IPv6 Address'),
        dataIndex: 'ipv6',
        render: (value) => value.map((it) => <div key={it}>{it}</div>),
        isHideable: true,
        stringify: (value) => value.join(','),
        sorter: false,
      },
      {
        title: t('Mac Address'),
        dataIndex: 'mac_address',
        isHideable: true,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (value) => portStatus[value] || value,
      },
    ];
    if (this.isInstanceDetail) {
      return columns.filter((it) => it.dataIndex !== 'server_name');
    }
    if (this.isNetworkDetail) {
      return columns.filter((it) => it.dataIndex !== 'network_name');
    }
    return columns;
  };

  get searchFilters() {
    const ret = [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: [
          { label: t('Active'), key: 'ACTIVE' },
          { label: t('Down'), key: 'DOWN' },
          { label: t('Error'), key: 'ERROR' },
          { label: t('Build'), key: 'BUILD' },
          { label: t('N/A'), key: 'N/A' },
        ],
      },
    ];
    if (!this.isNetworkDetail) {
      ret.splice(1, 0, {
        label: t('Owned Network'),
        name: 'network_name',
      });
    }
    return ret;
  }
}

export default inject('rootStore')(observer(VirtualAdapter));
