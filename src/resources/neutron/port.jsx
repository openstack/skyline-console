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
import { getOptions } from 'utils/index';
import { idNameColumn } from 'utils/table';

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
    // IPv6 cannot bind to floating ip
    if (!isIPv4(name)) {
      reason = `${t('It is IPv6 type.')}`;
      available = false;
      // external network
    } else if (it['router:external']) {
      reason = t('Is external network port');
      available = false;
      // already has FIP
    } else if (it.floatingIP) {
      reason = `${t('Is associate to floating ip: ')} ${it.floatingIP}`;
      available = false;
      // subnet unreachable by all FIPs
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

export function getPortsForPortFormItem(device_owner) {
  this.portStore.fetchList({ device_owner, project_id: this.currentProjectId });
}

export function getPortFormItem(withResourceNameAndStatusFilter = true) {
  const { portFixedIPs, fixedIpLoading } = this.state;
  const portFilters = [
    {
      label: t('Name'),
      name: 'name',
    },
    {
      label: t('Fixed IP'),
      name: 'fixed_ips',
      filterFunc: (record, val) => {
        return (record || []).some((it) => it.ip_address.includes(val));
      },
    },
  ];
  if (withResourceNameAndStatusFilter) {
    portFilters.push(
      ...[
        {
          label: t('Bind Resource Name'),
          name: 'server_name',
        },
        {
          label: t('Status'),
          name: 'status',
          options: getOptions(portStatus).filter((it) =>
            ['ACTIVE', 'DOWN'].includes(it.key)
          ),
        },
      ]
    );
  }
  const portColumns = [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('portDetail'),
    },
    {
      title: t('Description'),
      dataIndex: 'description',
    },
    {
      title: t('Fixed IPs'),
      dataIndex: 'fixed_ips',
      render: (data) => (
        <>
          {data.map((d, idx) => (
            <div key={`ip_address_${idx}`}>{d.ip_address}</div>
          ))}
        </>
      ),
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'sinceTime',
    },
  ];
  if (withResourceNameAndStatusFilter) {
    const extraColumns = [
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: portStatus,
      },
      {
        title: t('Bind Resource'),
        dataIndex: 'server_name',
        render: (server_name, item) => {
          const { device_id } = item;
          if (!device_id) {
            return '-';
          }
          const link = this.getLinkRender(
            'instanceDetail',
            device_id,
            { id: device_id },
            { tab: 'interface' }
          );
          return (
            <>
              {link}
              <br />
              {server_name || '-'}
            </>
          );
        },
      },
    ];
    portColumns.splice(4, 0, ...extraColumns);
  }
  return [
    {
      name: 'virtual_adapter',
      label: t('Virtual Adapter'),
      type: 'select-table',
      required: true,
      rowKey: 'id',
      data: this.portStore.list.data || [],
      isLoading: this.portStore.list.isLoading,
      disabledFunc: this.portsDisableFunc,
      onChange: this.handlePortSelect,
      isMulti: false,
      filterParams: portFilters,
      columns: portColumns,
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
  idNameColumn,
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
    valueMap: portStatus,
    sorter: false,
  },
];

export const portFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
];

export const getPortColumns = (self) => {
  return [
    {
      title: t('Port'),
      dataIndex: 'id',
    },
    {
      title: t('Bind Resource'),
      dataIndex: 'server_name',
      render: (server_name, item) => {
        const { device_id, device_owner } = item;
        if (device_id && device_owner === 'compute:nova') {
          const value = server_name
            ? `${device_id} (${server_name})`
            : device_id;
          const link = self.getLinkRender(
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
      dataIndex: 'network_id',
      routeName: self.getRouteName('networkDetail'),
      sorter: false,
      render: (value) => {
        const link = self.getLinkRender('networkDetail', value, { id: value });
        return <>{link}</>;
      },
    },
    {
      title: t('Mac Address'),
      dataIndex: 'mac_address',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      width: 80,
      valueMap: portStatus,
    },
  ];
};

export const portFilter = [
  {
    label: t('Network'),
    name: 'network_id',
  },
  {
    label: t('Status'),
    name: 'status',
    options: getOptions(portStatus),
  },
];

export const instancePortOptions = (self) => {
  return {
    columns: getPortColumns(self),
    filterParams: portFilter,
  };
};
