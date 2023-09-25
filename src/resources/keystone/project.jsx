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
import { yesNoOptions } from 'utils/constants';
import { getIdRender } from 'utils/table';

export const projectFilter = [
  {
    label: t('Project Name'),
    name: 'name',
  },
  {
    label: t('Project ID'),
    name: 'id',
  },
  {
    label: t('Domain Name'),
    name: 'domainName',
  },
  {
    label: t('Domain ID'),
    name: 'domain_id',
  },
  {
    label: t('Enabled'),
    name: 'enabled',
    options: yesNoOptions,
  },
];

export const projectColumns = [
  {
    title: t('Project ID/Name'),
    dataIndex: 'name',
    render: (value, record) => {
      const idRender = getIdRender(record.id, true, false);
      return (
        <>
          <div>{idRender}</div>
          <div>{value}</div>
        </>
      );
    },
  },
  {
    title: t('Domain ID/Name'),
    dataIndex: 'domainName',
    render: (value, record) => {
      const idRender = getIdRender(record.domain_id, true, false);
      return (
        <>
          <div>{idRender}</div>
          <div>{value}</div>
        </>
      );
    },
  },
  {
    title: t('Enabled'),
    dataIndex: 'enabled',
    valueRender: 'yesNo',
  },
  {
    title: t('description'),
    dataIndex: 'description',
    isHideable: true,
  },
];

export const projectTableOptions = {
  filterParams: projectFilter,
  columns: projectColumns,
};
