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
import { heatBase } from '../client/constants';

export class HeatClient extends Base {
  get baseUrl() {
    return heatBase();
  }

  get projectInUrl() {
    return true;
  }

  getDetailUrlForStack = ({ id, name }) => `stacks/${name}/${id}`;

  get resources() {
    return [
      {
        key: 'stacks',
        responseKey: 'stack',
        extendOperations: [
          {
            key: 'show',
            generate: ({ id, name }, params) => {
              return this.request.get(
                this.getDetailUrlForStack({ id, name }),
                params
              );
            },
          },
          {
            key: 'update',
            generate: ({ id, name }, data) =>
              this.request.put(this.getDetailUrlForStack({ id, name }), data),
          },
          {
            key: 'delete',
            generate: ({ id, name }) =>
              this.request.delete(this.getDetailUrlForStack({ id, name })),
          },
          {
            key: 'abandon',
            generate: ({ id, name }) =>
              this.request.delete(
                `${this.getDetailUrlForStack({ id, name })}/abandon`
              ),
          },
          {
            key: 'template',
            generate: ({ id, name }) =>
              this.request.get(
                `${this.getDetailUrlForStack({ id, name })}/template`
              ),
          },
          {
            key: 'events',
            generate: ({ id, name }) =>
              this.request.get(
                `${this.getDetailUrlForStack({ id, name })}/events`
              ),
          },
          {
            key: 'resources',
            generate: ({ id, name }) =>
              this.request.get(
                `${this.getDetailUrlForStack({ id, name })}/resources`
              ),
          },
        ],
      },
      {
        key: 'services',
        responseKey: 'service',
      },
    ];
  }
}

const heatClient = new HeatClient();
export default heatClient;
