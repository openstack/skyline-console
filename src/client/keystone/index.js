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
import { keystoneBase } from '../client/constants';

export class KeystoneClient extends Base {
  get baseUrl() {
    return keystoneBase();
  }

  get resources() {
    return [
      {
        name: 'catalog',
        key: 'auth/catalog',
        responseKey: 'catalog',
      },
      {
        name: 'authProjects',
        key: 'auth/projects',
        responseKey: 'projects',
      },
      {
        key: 'projects',
        responseKey: 'project',
        extendOperations: [
          {
            name: 'updateTags',
            key: 'tags',
            method: 'put',
          },
        ],
        subResources: [
          {
            key: 'tags',
            responseKey: 'tag',
          },
          {
            key: 'groups',
            subResources: [
              {
                key: 'roles',
              },
            ],
          },
          {
            key: 'users',
            subResources: [
              {
                key: 'roles',
              },
            ],
          },
        ],
      },
      {
        key: 'domains',
        responseKey: 'domain',
        subResources: [
          {
            key: 'groups',
            subResources: [
              {
                key: 'roles',
              },
            ],
          },
          {
            key: 'users',
            subResources: [
              {
                key: 'roles',
              },
            ],
          },
        ],
      },
      {
        key: 'roles',
        responseKey: 'role',
        subResources: [
          {
            key: 'implies',
          },
        ],
      },
      {
        name: 'roleAssignments',
        key: 'role_assignments',
      },
      {
        key: 'users',
        responseKey: 'user',
        subResources: [
          {
            key: 'projects',
          },
          {
            key: 'groups',
          },
          {
            name: 'applicationCredentials',
            key: 'application_credentials',
            responseKey: 'application_credential',
          },
        ],
        extendOperations: [
          {
            name: 'updatePassword',
            key: 'password',
            method: 'post',
          },
        ],
      },
      {
        key: 'groups',
        responseKey: 'group',
        subResources: [
          {
            key: 'users',
          },
        ],
      },
      {
        name: 'systemGroups',
        key: 'system/groups',
        subResources: [
          {
            key: 'roles',
          },
        ],
      },
      {
        name: 'systemUsers',
        key: 'system/users',
        subResources: [
          {
            key: 'roles',
          },
        ],
      },
    ];
  }
}

const keystoneClient = new KeystoneClient();
export default keystoneClient;
