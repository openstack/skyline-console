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

import { getZaqarClientId } from 'utils/zaqar';
import Base from '../client/base';
import { zaqarBase } from '../client/constants';

const withClientId = (conf = {}) => ({
  ...conf,
  headers: {
    ...(conf.headers || {}),
    'Client-ID': getZaqarClientId(),
  },
});

export class ZaqarClient extends Base {
  get baseUrl() {
    return zaqarBase();
  }

  get request() {
    const baseRequest = super.request;
    return {
      get: (url, params, conf) =>
        baseRequest.get(url, params, withClientId(conf)),
      post: (url, data, params, conf) =>
        baseRequest.post(url, data, params, withClientId(conf)),
      put: (url, data, params, conf) =>
        baseRequest.put(url, data, params, withClientId(conf)),
      delete: (url, data, params, conf) =>
        baseRequest.delete(url, data, params, withClientId(conf)),
      patch: (url, data, params, conf) =>
        baseRequest.patch(url, data, params, withClientId(conf)),
      head: (url, params, conf) =>
        baseRequest.head(url, params, withClientId(conf)),
      copy: (url, params, conf) =>
        baseRequest.copy(url, params, withClientId(conf)),
    };
  }

  get resources() {
    return [
      // Queues: GET /v2/queues, PUT /v2/queues/{name}, DELETE /v2/queues/{name}
      {
        name: 'queues',
        key: 'queues',
        responseKey: 'queue',
        extendOperations: [
          {
            name: 'create',
            generate: (queueName, data = {}) =>
              this.request.put(`queues/${queueName}`, data),
          },
          {
            name: 'getStats',
            generate: (queueName) =>
              this.request.get(`queues/${queueName}/stats`),
          },
          {
            name: 'postMessages',
            generate: (queueName, messages) =>
              this.request.post(`queues/${queueName}/messages`, { messages }),
          },
          {
            name: 'getMetadata',
            generate: (queueName) => this.request.get(`queues/${queueName}`),
          },
          {
            name: 'setMetadata',
            generate: (queueName, data) => {
              // Zaqar PATCH requires JSON Patch format with special content type.
              // Use "add" op — works for both new and existing keys.
              const patch = Object.keys(data).map((key) => ({
                op: 'add',
                path: `/metadata/${key}`,
                value: data[key],
              }));
              return this.request.patch(`queues/${queueName}`, patch, null, {
                headers: {
                  'Content-Type':
                    'application/openstack-messaging-v2.0-json-patch',
                },
              });
            },
          },
          {
            name: 'deleteQueue',
            generate: (queueName) => this.request.delete(`queues/${queueName}`),
          },
          {
            name: 'purge',
            generate: (queueName) =>
              this.request.delete(`queues/${queueName}/messages`, null, {
                pop: 20,
              }),
          },
          // createClaim uses raw axios to capture the Location header for the claim ID.
          // The X-Auth-Token is read from localStorage the same way request.js does it —
          // no validity check needed here because request interceptors handle token refresh.
          {
            name: 'createClaim',
            generate: (queueName, data) => {
              const Axios = require('axios').default;
              const { getLocalStorageItem } = require('utils/local-storage');
              const keystoneToken = getLocalStorageItem('keystone_token') || '';
              // limit goes as query param, ttl/grace go in body
              const { limit, ...body } = data;
              const url = `${this.baseUrl}/queues/${queueName}/claims${
                limit ? `?limit=${limit}` : ''
              }`;
              return Axios.post(url, body, {
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Client-ID': getZaqarClientId(),
                  ...(keystoneToken ? { 'X-Auth-Token': keystoneToken } : {}),
                },
                validateStatus: (status) => status < 500,
              });
            },
          },
        ],
        subResources: [
          {
            key: 'messages',
            responseKey: 'message',
          },
          {
            key: 'claims',
            responseKey: 'claim',
          },
          {
            key: 'subscriptions',
            responseKey: 'subscription',
          },
        ],
      },
    ];
  }
}

const zaqarClient = new ZaqarClient();
export default zaqarClient;
