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
import Progress from 'components/Progress';
import { isNumber } from 'lodash';

export const poolColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Protocol'),
    dataIndex: 'storage_protocol',
  },
  {
    title: t('Backend Name'),
    dataIndex: 'volume_backend_name',
    isHideable: true,
  },
  {
    title: t('Storage Capacity(GiB)'),
    dataIndex: 'usedGBPercent',
    isHideable: true,
    render: (value, record) =>
      isNumber(value) ? (
        <Progress
          value={value}
          label={`${record.usedGB} / ${record.total_capacity_gb}`}
        />
      ) : (
        '-'
      ),
    stringify: (value, record) =>
      isNumber(value)
        ? `${value}% (${t('Used')}: ${record.usedGB} / ${t('Total')}: ${
            record.total_capacity_gb
          })`
        : '-',
  },
];

export default poolColumns;
