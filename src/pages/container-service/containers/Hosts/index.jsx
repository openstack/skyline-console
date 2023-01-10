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
import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import globalHostsStore from 'src/stores/zun/hosts';
import Progress from 'components/Progress';

export class Hosts extends Base {
  init() {
    this.store = globalHostsStore;
    this.downloadStore = globalHostsStore;
  }

  get name() {
    return t('hosts');
  }

  get policy() {
    return 'host:get_all';
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: 'zuHostsDetailAdmin',
      },
      {
        title: t('Architecture'),
        dataIndex: 'architecture',
        isHideable: true,
      },
      {
        title: t('Total Containers'),
        dataIndex: 'total_containers',
        isHideable: true,
      },
      {
        title: t('CPU (Core)'),
        dataIndex: 'cpu_percent',
        render: (value, record) => (
          <Progress
            value={value}
            label={`${record.cpu_used} / ${record.cpus}`}
          />
        ),
        width: 180,
        stringify: (value, record) =>
          `${value}% (${t('Used')}: ${record.cpu_used} / ${t('Total')}: ${
            record.cpus
          })`,
      },
      {
        title: t('Configured Memory (GiB)'),
        dataIndex: 'memory_percent',
        render: (value, record) => (
          <Progress
            value={value}
            label={`${record.mem_used_gb} / ${record.mem_total_gb}`}
          />
        ),
        width: 180,
        stringify: (value, record) =>
          `${value}% (${t('Used')}: ${record.mem_used_gb} / ${t('Total')}: ${
            record.mem_total_gb
          })`,
      },
      {
        title: t('Configured Disk (GiB)'),
        dataIndex: 'disk_percent',
        render: (value, record) => (
          <Progress
            value={value}
            label={`${record.disk_used} / ${record.disk_total}`}
          />
        ),
        width: 180,
        stringify: (value, record) =>
          `${value}% (${t('Used')}: ${record.disk_used} / ${t('Total')}: ${
            record.disk_total
          })`,
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Hosts));
