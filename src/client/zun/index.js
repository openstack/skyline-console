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

import { zunBase, zunEndpoint } from 'client/client/constants';
import Base from '../client/base';

export class ZunClient extends Base {
  get baseUrl() {
    return zunBase();
  }

  get enable() {
    return !!zunEndpoint();
  }

  get resources() {
    return [
      {
        key: 'capsules',
        responseKey: 'capsule',
      },
      {
        key: 'containers',
        responseKey: 'container',
        extendOperations: [
          {
            key: 'start',
            method: 'post',
          },
          {
            key: 'stop',
            method: 'post',
          },
          {
            key: 'pause',
            method: 'post',
          },
          {
            key: 'reboot',
            method: 'post',
          },
          {
            key: 'unpause',
            method: 'post',
          },
          {
            key: 'rebuild',
            method: 'post',
          },
          {
            key: 'kill',
            method: 'post',
          },
          {
            key: 'execute',
            method: 'post',
          },
          {
            key: 'attach',
            method: 'get',
          },
          {
            key: 'network_attach',
            method: 'post',
          },
          {
            key: 'network_detach',
            method: 'post',
          },
        ],
        subResources: [
          {
            key: 'stats',
          },
          {
            name: 'actions',
            key: 'container_actions',
            responseKey: 'containerAction',
          },
          {
            key: 'logs',
          },
        ],
      },
      {
        key: 'hosts',
        responseKey: 'host',
      },
      {
        key: 'quotas',
      },
      {
        key: 'services',
        responseKey: 'service',
      },
    ];
  }
}

const zunClient = new ZunClient();
export default zunClient;
