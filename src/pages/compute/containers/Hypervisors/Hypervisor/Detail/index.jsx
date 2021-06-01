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

import { inject, observer } from 'mobx-react';
import { HypervisorStore } from 'stores/nova/hypervisor';
import Base from 'containers/TabDetail';
import Members from 'pages/compute/containers/Instance';
import Link from 'react-router-dom/Link';
import React from 'react';

@inject('rootStore')
@observer
export default class HypervisorDetail extends Base {
  get name() {
    return t('hypervisor');
  }

  get policy() {
    return 'os_compute_api:os-hypervisors';
  }

  get listUrl() {
    return '/compute/hypervisors-admin';
  }

  get detailInfos() {
    return [
      {
        title: t('Hostname'),
        dataIndex: 'hypervisor_hostname',
      },
      {
        title: t('Type'),
        dataIndex: 'hypervisor_type',
      },
      {
        title: t('VCPU (Core)'),
        dataIndex: 'vcpus_used_percent',
        render: (value, record) => `${record.vcpus_used} / ${record.vcpus}`,
      },
      {
        title: t('Configured Memory (GB)'),
        dataIndex: 'memory_mb_percent',
        render: (value, record) =>
          `${record.memory_mb_used} / ${record.memory_mb}`,
      },
      {
        title: t('Used Local Storage (GB)'),
        dataIndex: 'storage_percent',
        render: () => (
          <Link to="/monitor-center/storage-cluster-admin">
            {t('Click to see')}
          </Link>
        ),
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Members'),
        key: 'members',
        component: Members,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new HypervisorStore();
  }
}
