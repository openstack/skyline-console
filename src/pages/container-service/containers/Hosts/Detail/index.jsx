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
import Base from 'containers/TabDetail';
import globalHostsStore from 'src/stores/zun/hosts';
import BaseDetail from './BaseDetail';

export class HostsDetail extends Base {
  init() {
    this.store = globalHostsStore;
  }

  get name() {
    return t('Hosts Detail');
  }

  get listUrl() {
    return this.getRoutePath('zunHosts');
  }

  get policy() {
    return 'host:get';
  }

  get detailInfos() {
    return [
      {
        title: t('Hostname'),
        dataIndex: 'name',
      },
      {
        title: t('CPU (Core)'),
        dataIndex: 'cpu_percent',
        render: (value, record) => `${record.cpu_used} / ${record.cpus}`,
      },
      {
        title: t('Configured Memory (GiB)'),
        dataIndex: 'memory_percent',
        render: (value, record) =>
          `${record.mem_used_gb} / ${record.mem_total_gb}`,
      },
      {
        title: t('Configured Disk (GiB)'),
        dataIndex: 'disk_percent',
        render: (value, record) => `${record.disk_used} / ${record.disk_total}`,
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(HostsDetail));
