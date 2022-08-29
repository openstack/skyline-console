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
import { manilaBase, manilaEndpoint } from '../client/constants';

export class ManilaClient extends Base {
  get baseUrl() {
    return manilaBase();
  }

  get enable() {
    return !!manilaEndpoint();
  }

  get projectInUrl() {
    return true;
  }

  get resources() {
    return [
      {
        name: 'azones',
        key: 'availability-zones',
      },
      {
        key: 'shares',
        responseKey: 'share',
        subResources: [
          {
            name: 'exportLocations',
            key: 'export_locations',
            responseKey: 'export_location',
          },
          {
            key: 'metadata',
            responseKey: 'metadata',
          },
        ],
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        key: 'types',
        responseKey: 'share_type',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
          {
            name: 'getAccess',
            key: 'share_type_access',
          },
          {
            key: 'default',
          },
        ],
        subResources: [
          {
            name: 'extraSpecs',
            key: 'extra_specs',
            responseKey: 'extra_spec',
          },
        ],
      },
      {
        name: 'shareGroupTypes',
        key: 'share-group-types',
        responseKey: 'share_group_type',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
          {
            name: 'getAccess',
            key: 'access',
          },
          {
            key: 'default',
          },
        ],
        subResources: [
          {
            name: 'groupSpecs',
            key: 'group-specs',
            responseKey: 'group_spec',
          },
        ],
      },
      {
        name: 'shareInstances',
        key: 'share_instances',
        responseKey: 'share_instance',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
        subResources: [
          {
            name: 'exportLocations',
            key: 'export_locations',
            responseKey: 'export_location',
          },
        ],
      },
      {
        name: 'shareNetworks',
        key: 'share-networks',
        responseKey: 'share_network',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
        subResources: [
          {
            key: 'subnets',
            responseKey: 'subnet',
          },
        ],
      },
      {
        name: 'shareGroups',
        key: 'share-groups',
        responseKey: 'share_group',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        name: 'shareAccessRules',
        key: 'share-access-rules',
        responseKey: 'access_list',
        extendOperations: [
          {
            name: 'updateMetadata',
            key: 'metadata',
            method: 'put',
          },
        ],
        subResources: [
          {
            key: 'metadata',
            responseKey: 'metadata',
          },
        ],
      },
      {
        name: 'quotaSets',
        key: 'quota-sets',
        responseKey: 'quota_set',
      },
      {
        name: 'shareServers',
        key: 'share-servers',
        responseKey: 'share_server',
      },
      {
        name: 'pools',
        key: 'scheduler-stats/pools/detail',
        responseKey: 'pool',
      },
    ];
  }
}

const manilaClient = new ManilaClient();
export default manilaClient;
