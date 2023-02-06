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
import { magnumBase } from '../client/constants';

export class MagnumClient extends Base {
  get baseUrl() {
    return magnumBase();
  }

  get resources() {
    return [
      {
        name: 'clusters',
        key: 'clusters',
        responseKey: 'cluster',
        extendOperations: [
          {
            name: 'resize',
            key: 'actions/resize',
            method: 'post',
          },
          {
            name: 'upgrade',
            key: 'actions/upgrade',
            method: 'post',
          },
        ],
      },
      {
        name: 'clusterTemplates',
        key: 'clustertemplates',
        responseKey: 'clustertemplate',
      },
      {
        key: 'quotas',
        subResources: [
          {
            name: 'cluster',
            key: 'Cluster',
          },
        ],
        extendOperations: [
          {
            name: 'updateQuota',
            key: 'Cluster',
            method: 'patch',
          },
        ],
      },
    ];
  }
}

const magnumClient = new MagnumClient();
export default magnumClient;
