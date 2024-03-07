// Copyright 2022 99cloud
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
import { PortStore } from 'stores/neutron/port-extension';
import { portStatus } from 'resources/neutron/port';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class Port extends Base {
  init() {
    this.store = new PortStore();
    this.downloadStore = new PortStore();
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
        this.path.includes('networks-admin/detail')) &&
      !this.isSubnetDetail
    );
  }

  get isSubnetDetail() {
    return this.inDetailPage && this.path.includes('subnet');
  }

  get isRecycleBinDetail() {
    return this.inDetailPage && this.path.includes('recycle-bin');
  }

  get isFilterByBackend() {
    return !this.isSubnetDetail;
  }

  get isSortByBackend() {
    return this.isFilterByBackend;
  }

  get defaultSortKey() {
    return this.isFilterByBackend ? 'status' : '';
  }

  updateFetchParamsByPage = (params) => {
    const { id, ...rest } = params;
    const newParams = { ...rest };
    if (this.isInstanceDetail) {
      newParams.device_id = id;
    } else if (this.isNetworkDetail) {
      newParams.network_id = id;
    }
    return newParams;
  };

  updateFetchParams = (params) => {
    const { id, networkId, ...rest } = params;
    return {
      network_id: networkId,
      subnetId: id,
      ...rest,
    };
  };

  get policy() {
    return 'get_port';
  }

  get name() {
    return t('ports');
  }

  get adminPageHasProjectFilter() {
    return true;
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

  renderResource = (serverName, item) => {
    const { device_id, device_owner } = item;
    if (!device_owner) {
      return device_id || '-';
    }
    let value = device_id;
    let link = null;
    if (device_owner === 'compute:nova') {
      value = serverName ? `${device_id} (${serverName})` : device_id;
      link = this.getLinkRender(
        'instanceDetail',
        value,
        { id: device_id },
        { tab: 'interface' }
      );
    } else if (
      [
        'network:router_interface',
        'network:ha_router_replicated_interface',
        'network:router_ha_interface',
      ].includes(device_owner)
    ) {
      link = this.getLinkRender('routerDetail', value, { id: device_id });
    } else if (device_owner === 'network:floatingip') {
      link = this.getLinkRender('fipDetail', value, { id: device_id });
    }
    if (link) {
      return (
        <>
          {device_owner}
          <br />
          {link}
        </>
      );
    }
    return (
      <>
        {device_owner}
        <br />
        {device_id || '-'}
      </>
    );
  };

  getPortDetailRoute = () => {
    if (this.isSubnetDetail) {
      return {
        routeName: this.getRouteName('subnetPortDetail'),
        routeParamsFunc: (data) => ({
          networkId: data.network_id,
          subnetId: data.subnet_id,
          id: data.id,
        }),
      };
    }
    if (this.isNetworkDetail) {
      return {
        routeName: this.getRouteName('networkPortDetail'),
        routeParamsFunc: (data) => ({
          networkId: data.network_id,
          id: data.id,
        }),
      };
    }
    if (this.isInstanceDetail) {
      return {
        routeName: this.getRouteName('instancePortDetail'),
        routeParamsFunc: (data) => ({
          instanceId: data.device_id,
          id: data.id,
        }),
      };
    }
    return { routeName: this.getRouteName('portDetail') };
  };

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        ...this.getPortDetailRoute(),
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
        stringify: (serverName, item) => {
          const { device_id, device_owner } = item;
          if (device_id && device_owner === 'compute:nova' && serverName) {
            return `${device_owner} \n ${device_id} (${serverName})`;
          }
          return `
            ${device_owner} ${device_owner && `\n`}
            ${device_id || '-'}
          `;
        },
        render: this.renderResource,
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Owned Network ID/Name'),
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
        valueMap: portStatus,
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
    const deviceOwner = {
      label: t('Device Owner'),
      name: 'device_owner',
      options: [
        {
          label: t('Instance'),
          key: 'compute:nova',
          checkLabel: t('View virtual adapters'),
          isQuick: true,
        },
        {
          label: t('Router'),
          key: 'network:router_ha_interface,network:ha_router_replicated_interface,network:router_interface,network:router_gateway,network:router_interface_distributed,network:router_centralized_snat',
        },
        {
          label: t('Floating IP'),
          key: 'network:floatingip,network:floatingip_agent_gateway',
        },
        { label: t('DHCP Agent'), key: 'network:dhcp' },
        {
          label: t('Others'),
          key: 'network:local_ip,network:routed,network:distributed,compute:kuryr,Octavia',
        },
        {
          label: t('Unbounded'),
          key: 'none',
        },
      ],
    };
    if (this.isSubnetDetail) {
      deviceOwner.filterFunc = (value, filter) => {
        if (filter === 'none') {
          return !value;
        }
        return value && filter.includes(value);
      };
    }
    if (!this.isInstanceDetail) {
      ret.push(deviceOwner);
    }

    return ret;
  }
}

export default inject('rootStore')(observer(Port));
