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
import { skylineBase } from '../client/constants';

export class SkylineClient extends Base {
  get baseUrl() {
    return skylineBase();
  }

  get resources() {
    return [
      {
        key: 'contrib',
        isResource: false,
        extendOperations: [
          {
            key: 'domains',
          },
          {
            key: 'regions',
          },
          {
            name: 'keystoneEndpoints',
            key: 'keystone_endpoints',
          },
        ],
      },
      {
        key: 'extension',
        isResource: false,
        extendOperations: [
          {
            key: 'servers',
          },
          {
            name: 'recycleServers',
            key: 'recycle_servers',
          },
          {
            key: 'volumes',
          },
          {
            name: 'volumeSnapshots',
            key: 'volume_snapshots',
          },
          {
            key: 'ports',
          },
          {
            name: 'computeServices',
            key: 'compute-services',
          },
        ],
      },
      {
        name: 'policies',
        key: 'policies',
        extendOperations: [
          {
            name: 'check',
            key: 'check',
            isDetail: false,
          },
        ],
      },
      {
        name: '',
        key: '',
        isResource: false,
        extendOperations: [
          {
            key: 'login',
            method: 'post',
          },
          {
            key: 'logout',
            method: 'post',
          },
          {
            key: 'profile',
          },
          {
            name: 'switchProject',
            method: 'post',
            generate: (projectId, domainId) => {
              const url = `switch_project/${projectId}`;
              const data = {
                project_id: projectId,
                project_domain_id: domainId,
              };
              const params = {
                project_domain_id: domainId,
              };
              return this.request.post(url, data, params);
            },
          },
        ],
      },
      {
        key: 'setting',
        responseKey: 'setting',
        extendOperations: [
          {
            key: 'list',
            url: () => 'settings',
          },
        ],
      },
      {
        key: 'query',
      },
      {
        name: 'queryRange',
        key: 'query_range',
      },
      {
        key: 'sso',
      },
      {
        key: 'config',
        isResource: false,
        extendOperations: [
          {
            key: 'getUserDefaultDomain',
            url: () => 'config',
          },
        ],
      },
    ];
  }
}

const skylineClient = new SkylineClient();
export default skylineClient;
