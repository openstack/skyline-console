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
import RuleButton from 'components/TableButton/RuleButton';

export const securityGroupColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'sinceTime',
  },
  {
    title: t('Rules'),
    dataIndex: 'rules',
    render: (_, record) => <RuleButton item={record} />,
  },
];

export const securityGroupFilter = [
  {
    label: t('Name'),
    name: 'name',
  },
];
