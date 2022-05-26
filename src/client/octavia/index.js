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

import Base from '../client/base';
import { octaviaBase } from '../client/constants';

export class OctaviaClient extends Base {
  get baseUrl() {
    return octaviaBase();
  }

  get resources() {
    return [
      {
        name: 'healthMonitors',
        key: 'lbaas/healthmonitors',
        responseKey: 'healthmonitor',
      },
      {
        name: 'listeners',
        key: 'lbaas/listeners',
        responseKey: 'listener',
      },
      {
        name: 'loadbalancers',
        key: 'lbaas/loadbalancers',
        responseKey: 'loadbalancer',
      },
      {
        name: 'pools',
        key: 'lbaas/pools',
        responseKey: 'pool',
        extendOperations: [
          {
            name: 'batchUpdateMembers',
            key: 'members',
            method: 'put',
          },
        ],
        subResources: [
          {
            key: 'members',
          },
        ],
      },
    ];
  }
}

const octaviaClient = new OctaviaClient();
export default octaviaClient;
