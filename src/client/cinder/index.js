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
import { cinderBase, cinderEndpoint } from '../client/constants';

export class CinderClient extends Base {
  get baseUrl() {
    return cinderBase();
  }

  get enable() {
    return !!cinderEndpoint();
  }

  get projectInUrl() {
    return true;
  }

  get resources() {
    return [
      {
        key: 'volumes',
        responseKey: 'volume',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        key: 'types',
        responseKey: 'volume_type',
        extendOperations: [
          {
            key: 'action',
            method: 'post',
          },
          {
            name: 'getAccess',
            key: 'os-volume-type-access',
          },
        ],
        subResources: [
          {
            name: 'extraSpecs',
            key: 'extra_specs',
            responseKey: 'extra_spec',
          },
          {
            key: 'encryption',
          },
        ],
      },
      {
        key: 'snapshots',
        responseKey: 'snapshot',
      },
      {
        key: 'backups',
        responseKey: 'backup',
        extendOperations: [
          {
            key: 'restore',
            isDetail: true,
            method: 'post',
          },
        ],
      },
      {
        name: 'backupChains',
        key: 'backup_chains',
        responseKey: 'backup_chain',
        extendOperations: [
          {
            key: 'restore',
            isDetail: true,
            method: 'post',
          },
        ],
      },
      {
        name: 'pools',
        key: 'scheduler-stats/get_pools',
        responseKey: 'pool',
      },
      {
        name: 'qosSpecs',
        key: 'qos-specs',
        responseKey: 'qos_spec',
        extendOperations: [
          {
            name: 'deleteKeys',
            key: 'delete_keys',
            method: 'put',
          },
          {
            key: 'associate',
          },
          {
            key: 'disassociate',
          },
        ],
      },
      {
        name: 'services',
        key: 'os-services',
        responseKey: 'service',
        extendOperations: [
          {
            key: 'enable',
            isDetail: false,
            method: 'put',
          },
          {
            name: 'reason',
            key: 'disable-log-reason',
            isDetail: false,
            method: 'put',
          },
        ],
      },
      {
        name: 'quotaSets',
        key: 'os-quota-sets',
        responseKey: 'quota_set',
      },
      {
        name: 'azones',
        key: 'os-availability-zone',
      },
      {
        name: 'volumeTransfers',
        key: 'volume-transfers',
        extendOperations: [
          {
            key: 'accept',
            method: 'post',
          },
        ],
      },
    ];
  }
}

const cinderClient = new CinderClient();
export default cinderClient;
