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
import { yesNoOptions } from 'utils/constants';
import globalRootStore from 'stores/root';
import { getDefaultFilter } from './firewall';

export const actionInfos = {
  allow: t('ALLOW'),
  deny: t('DENY'),
  reject: t('REJECT'),
};

export const protocolInfos = {
  tcp: t('TCP'),
  udp: t('UDP'),
  icmp: t('ICMP'),
  any: t('ANY'),
};

export const tableColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    isHideable: true,
  },
  {
    title: t('Protocol'),
    dataIndex: 'protocol',
    valueMap: protocolInfos,
  },
  {
    title: t('Source IP'),
    dataIndex: 'source_ip_address',
  },
  {
    title: t('Source Port'),
    dataIndex: 'source_port',
  },
  {
    title: t('Destination IP'),
    dataIndex: 'destination_ip_address',
  },
  {
    title: t('Destination Port'),
    dataIndex: 'destination_port',
  },
  {
    title: t('Rule Action'),
    dataIndex: 'action',
    valueMap: actionInfos,
  },
  {
    title: t('Enabled'),
    dataIndex: 'enabled',
    valueRender: 'yesNo',
  },
  {
    title: t('Shared'),
    dataIndex: 'shared',
    valueRender: 'yesNo',
  },
];

export const tableFilter = [
  {
    label: t('Name'),
    name: 'name',
  },
  {
    label: t('Protocol'),
    name: 'protocol',
    options: getOptions(protocolInfos),
  },
  {
    label: t('Rule Action'),
    name: 'action',
    options: getOptions(actionInfos),
  },
  {
    label: t('Enabled'),
    name: 'enabled',
    options: yesNoOptions,
  },
  {
    label: t('Shared'),
    name: 'shared',
    options: yesNoOptions,
  },
  getDefaultFilter(t('Hide Default Rules')),
];

export const tableOptions = {
  filterParams: tableFilter,
  columns: tableColumns,
};

export const isMine = (item) => item.project_id === globalRootStore.projectId;

export const isDefault = (item) =>
  [
    'default egress ipv4',
    'default egress ipv6',
    'default ingress ipv4',
    'default ingress ipv6',
  ].includes(item.name);
