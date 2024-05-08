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

import { getOptions } from 'utils/index';
import { portStatus } from 'resources/neutron/port';

export const instanceInterfaceOwners = ['compute:nova'];

export const routerInterfaceOwners = [
  'network:router_interface',
  'network:ha_router_replicated_interface',
  'network:router_interface_distributed',
];

export const tableColumns = [
  {
    title: t('Port'),
    dataIndex: 'id',
    width: 150,
  },
  {
    title: t('Network'),
    dataIndex: 'network_name',
  },
  {
    title: t('Subnet'),
    dataIndex: 'subnet_name',
  },
  {
    title: t('IP Address'),
    dataIndex: 'ip_address',
  },
  {
    title: t('Owner'),
    dataIndex: 'owner',
  },
  {
    title: t('Device'),
    dataIndex: 'device_name',
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    valueMap: portStatus,
  },
];

export const tableFilter = [
  {
    label: t('Network'),
    name: 'network',
    filterFunc: (record, value) => (record || {}).name.includes(value),
  },
  {
    label: t('Device'),
    name: 'router',
    filterFunc: (record, value) => (record || {}).name.includes(value),
  },
  {
    label: t('Status'),
    name: 'status',
    options: getOptions(portStatus),
  },
];

export const tableOptions = {
  filterParams: tableFilter,
  columns: tableColumns,
};
