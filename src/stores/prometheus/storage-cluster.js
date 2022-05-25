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

import { action, observable, set } from 'mobx';
import MonitorBase from 'stores/prometheus/monitor-base';

export class StorageClusterStore extends MonitorBase {
  @observable
  storageClusterUsage = {
    isLoading: false,
    data: {
      used: 0,
      total: 0,
    },
  };

  @action
  getStorageClusterUsage = async (query = '') => {
    set(this.storageClusterUsage, {
      isLoading: true,
      data: {
        used: 0,
        total: 0,
      },
    });
    const query1 = 'ceph_cluster_total_used_bytes';
    const query2 = 'ceph_cluster_total_bytes';
    const [used, total] = await Promise.all([
      await this.buildRequest(query1 + query, 'current'),
      await this.buildRequest(query2 + query, 'current'),
    ]);
    set(this.storageClusterUsage, {
      isLoading: false,
      data: {
        used:
          used.data.result.length === 0
            ? 0
            : this.formatToGiB(used.data.result[0].value[1]),
        total:
          total.data.result.length === 0
            ? 0
            : this.formatToGiB(total.data.result[0].value[1]),
      },
    });
  };
}

const globalStorageClusterStore = new StorageClusterStore();

export default globalStorageClusterStore;
