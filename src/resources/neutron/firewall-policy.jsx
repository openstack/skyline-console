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
import globalRootStore from 'stores/root';
import { getDefaultFilter } from './firewall';

export const tableColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
  },
  {
    title: t('Rules'),
    dataIndex: 'rules',
    render: (value) => {
      if (!value || value.length === 0) {
        return '-';
      }
      return value.map((item) => <div key={item.id}>{item.name}</div>);
    },
  },
  {
    title: t('Shared'),
    dataIndex: 'shared',
    valueRender: 'yesNo',
  },
  {
    title: t('Audited'),
    dataIndex: 'audited',
    valueRender: 'yesNo',
  },
];

export const tableFilter = [
  {
    label: t('Name'),
    name: 'name',
  },
  getDefaultFilter(t('Hide Default Policies')),
];

export const tableOptions = {
  filterParams: tableFilter,
  columns: tableColumns,
};

export const isDefault = (item) =>
  item.name === 'default egress' || item.name === 'default ingress';
export const isMine = (item) => item.project_id === globalRootStore.projectId;
