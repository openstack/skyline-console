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
import { ipValidate } from 'utils/validate';

const { isIPv4 } = ipValidate;

export const portStatus = {
  ACTIVE: t('Active'),
  BUILD: t('Build'),
  DOWN: t('Down'),
  ERROR: t('Error'),
};

export const portState = {
  UP: t('Up'),
  DOWN: t('Down'),
};

export const bindingTypes = {
  normal: t('Normal'),
  direct: t('Direct'),
  macvtap: t('MacVTap'),
};

export const portSortProps = {
  isSortByBack: true,
  defaultSortKey: 'status',
  defaultSortOrder: 'descend',
};

export function getPortsAndReasons(
  interfaces,
  canReachSubnetIdsWithRouterId,
  forOneFIP = false
) {
  return interfaces.map((it) => {
    let available = true;
    let reason = '';
    const name = it.fixed_ip_address;
    // ipv6不可绑定浮动ip
    if (!isIPv4(name)) {
      reason = `${t('It is IPv6 type.')}`;
      available = false;
      // 外部网络
    } else if (it['router:external']) {
      reason = t('Is external network port');
      available = false;
      // 绑定过浮动ip了
    } else if (it.floatingIP) {
      reason = `${t('Is associate to floating ip: ')} ${it.floatingIP}`;
      available = false;
      // 所有浮动ip均不可达的子网
    } else if (
      canReachSubnetIdsWithRouterId.findIndex(
        (item) => item.subnet_id === it.subnet_id
      ) < 0
    ) {
      reason = forOneFIP
        ? `${t('It is unreachable for this floating ip.')}`
        : `${t('It is unreachable for all floating ips.')}`;
      available = false;
    }
    return {
      ...it,
      key: name,
      name,
      available,
      reason,
    };
  });
}

export function getPortFormItem(device_owner) {
  const { portFixedIPs, fixedIpLoading } = this.state;
  return [
    {
      name: 'virtual_adapter',
      label: t('Virtual Adapter'),
      type: 'select-table',
      required: true,
      rowKey: 'id',
      backendPageStore: this.portStore,
      disabledFunc: this.portsDisableFunc,
      onChange: this.handlePortSelect,
      extraParams: { device_owner, project_id: this.currentProjectId },
      isMulti: false,
      ...portSortProps,
      filterParams: [
        {
          label: t('Name'),
          name: 'name',
        },
        {
          label: t('Fixed IP'),
          name: 'fixedIP',
        },
      ],
      columns: [
        {
          title: t('ID/Name'),
          dataIndex: 'name',
          routeName: this.getRouteName('virtualAdapterDetail'),
        },
        {
          title: t('Description'),
          dataIndex: 'description',
          sorter: false,
        },
        {
          title: t('Fixed IPs'),
          dataIndex: 'fixed_ips',
          sorter: false,
          render: (data) => (
            <>
              {data.map((d, idx) => (
                <div key={`ip_address_${idx}`}>{d.ip_address}</div>
              ))}
            </>
          ),
        },
        {
          title: t('Status'),
          dataIndex: 'status',
          render: (value) => portStatus[value] || value,
        },
        {
          title: t('Created At'),
          dataIndex: 'created_at',
          valueRender: 'sinceTime',
          isHideable: true,
          sorter: false,
        },
      ],
    },
    {
      name: 'fixed_ip_address',
      label: t('Fixed IP'),
      type: 'select-table',
      rowKey: 'fixed_ip_address',
      required: true,
      data: portFixedIPs,
      isLoading: fixedIpLoading,
      isMulti: false,
      filterParams: [
        {
          label: t('Ip Address'),
          name: 'name',
        },
      ],
      columns: [
        {
          title: t('Ip Address'),
          dataIndex: 'name',
        },
        {
          title: t('Subnet ID'),
          dataIndex: 'subnet_id',
        },
        {
          title: t('Reason'),
          dataIndex: 'reason',
        },
      ],
      disabledFunc: (record) => !record.available,
    },
  ];
}

export const portColumns = [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    sorter: false,
    render: (value, record) => (
      <div>
        <div>{record.id}</div>
        <div>{value || '-'}</div>
      </div>
    ),
  },
  {
    title: t('Owned Network'),
    dataIndex: 'network_name',
    isLink: true,
    idKey: 'network_id',
    sorter: false,
  },
  {
    title: t('IPv4 Address'),
    dataIndex: 'ipv4',
    render: (value) => value.map((it) => <div key={it}>{it}</div>),
    sorter: false,
  },
  {
    title: t('IPv6 Address'),
    dataIndex: 'ipv6',
    render: (value) => value.map((it) => <div key={it}>{it}</div>),
    sorter: false,
  },
  {
    title: t('Mac Address'),
    dataIndex: 'mac_address',
    sorter: false,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    render: (value) => portStatus[value] || value,
    sorter: false,
  },
];

export const portFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
];
