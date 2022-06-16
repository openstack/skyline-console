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

import Base from 'stores/base';
import client from 'client';
import { getGiBValue } from 'utils';

export class HostsStore extends Base {
  get client() {
    return client.zun.hosts;
  }

  mapper(data) {
    const { mem_total, mem_used, cpus, cpu_used, disk_total, disk_used } = data;
    return {
      ...data,
      id: data.uuid,
      name: data.hostname,
      cpu_percent: cpus ? ((cpu_used / cpus) * 100).toFixed(2) : 0,
      memory_percent: mem_total ? ((mem_used / mem_total) * 100).toFixed(2) : 0,
      mem_total_gb: getGiBValue(mem_total),
      mem_used_gb: getGiBValue(mem_used),
      disk_percent: disk_total
        ? ((disk_used / disk_total) * 100).toFixed(2)
        : 0,
    };
  }
}

const globalHostsStore = new HostsStore();
export default globalHostsStore;
