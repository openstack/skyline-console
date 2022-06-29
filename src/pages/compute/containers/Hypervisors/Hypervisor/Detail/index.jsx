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
import { inject, observer } from 'mobx-react';
import { HypervisorStore } from 'stores/nova/hypervisor';
import Base from 'containers/TabDetail';
import Members from 'pages/compute/containers/Instance';
import { Tooltip } from 'antd';

export class HypervisorDetail extends Base {
  get name() {
    return t('hypervisor');
  }

  get policy() {
    return 'os_compute_api:os-hypervisors:show';
  }

  get listUrl() {
    return this.getRoutePath('hypervisor');
  }

  get detailInfos() {
    const info = [
      {
        title: t('Hostname'),
        dataIndex: 'service_host',
      },
      {
        title: t('Type'),
        dataIndex: 'hypervisor_type',
      },
      {
        title: t('VCPU (Core)'),
        dataIndex: 'vcpus_used_percent',
        render: (value, record) =>
          record.hypervisor_type === 'ironic' ? (
            <Tooltip
              title={t('vCPUs and ram are not used for bare metal scheduling')}
            >
              <span>-</span>
            </Tooltip>
          ) : (
            `${record.vcpus_used} / ${record.vcpus}`
          ),
      },
      {
        title: t('Configured Memory (GiB)'),
        dataIndex: 'memory_mb_percent',
        render: (value, record) =>
          record.hypervisor_type === 'ironic' ? (
            <Tooltip
              title={t('vCPUs and ram are not used for bare metal scheduling')}
            >
              <span>-</span>
            </Tooltip>
          ) : (
            `${record.memory_mb_used_gb} / ${record.memory_mb_gb}`
          ),
      },
    ];
    const { vgpus, vgpus_used } = this.store.detail;
    if (vgpus) {
      info.push({
        title: t('VGPU (Core)'),
        dataIndex: 'vgpus',
        render: () => `${vgpus_used} / ${vgpus}`,
      });
    }
    return info;
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

export default inject('rootStore')(observer(HypervisorDetail));
