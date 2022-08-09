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
import { troveBase } from '../client/constants';

export class TroveClient extends Base {
  get baseUrl() {
    return troveBase();
  }

  get projectInUrl() {
    return true;
  }

  get resources() {
    return [
      {
        name: 'instances',
        key: 'instances',
        responseKey: 'instance',
        subResources: [
          {
            key: 'users',
            responseKey: 'user',
          },
          {
            key: 'databases',
            responseKey: 'database',
          },
          {
            key: 'backups',
            responseKey: 'backup',
          },
          {
            key: 'log',
            responseKey: 'log',
          },
        ],
        extendOperations: [
          {
            name: 'grantDatabase',
            generate: (id, subId, body) => {
              return this.request.put(
                `${this.getDetailUrl(
                  'instances',
                  id
                )}/users/${subId}/databases`,
                body
              );
            },
          },
          {
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        name: 'datastores',
        key: 'datastores',
        responseKey: 'datastore',
      },
      {
        name: 'backups',
        key: 'backups',
        responseKey: 'backup',
      },
      {
        name: 'configurations',
        key: 'configurations',
        responseKey: 'configuration',
        extendOperations: [
          {
            key: 'get',
            generate: (data) =>
              this.request.get(
                this.getDetailUrl('configurations', data),
                null,
                {
                  headers: {
                    'content-type': 'application/json',
                  },
                }
              ),
          },
        ],
      },
      {
        name: 'instancesAdmin',
        key: 'mgmt/instances',
        responseKey: 'instance',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        name: 'quotas',
        key: 'mgmt/quotas',
        responseKey: 'quota',
      },
    ];
  }
}

const troveClient = new TroveClient();
export default troveClient;
