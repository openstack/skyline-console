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
import { designateBase } from '../client/constants';

export class DesignateClient extends Base {
  get baseUrl() {
    return designateBase();
  }

  get resources() {
    return [
      {
        name: 'zones',
        key: 'zones',
        responseKey: 'zone',
        subResources: [
          {
            key: 'recordsets',
            responseKey: 'recordset',
          },
        ],
      },
      {
        name: 'reverse',
        key: 'reverse',
        responseKey: 'reverse',
        extendOperations: [
          {
            key: 'reverseDetail',
            generate: (data) =>
              this.request.get(
                this.getSubResourceUrlById('reverse', data, 'floatingips'),
                null,
                {
                  headers: {
                    'content-type': 'application/json',
                  },
                }
              ),
          },
          {
            key: 'setReverse',
            generate: (id, data) =>
              this.request.patch(
                this.getSubResourceUrlById('reverse', id, 'floatingips'),
                data,
                null,
                {
                  headers: {
                    'content-type': 'application/json',
                  },
                }
              ),
          },
          {
            key: 'unsetReverse',
            generate: (id, data) =>
              this.request.patch(
                this.getSubResourceUrlById('reverse', id, 'floatingips'),
                data,
                null,
                {
                  headers: {
                    'content-type': 'application/json',
                  },
                }
              ),
          },
        ],
        subResources: [
          {
            key: 'floatingips',
            responseKey: 'floatingip',
          },
        ],
      },
    ];
  }
}

const designateClient = new DesignateClient();
export default designateClient;
