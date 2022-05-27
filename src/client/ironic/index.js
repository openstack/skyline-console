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
import { ironicBase } from '../client/constants';

export class IronicClient extends Base {
  get baseUrl() {
    return ironicBase();
  }

  get resources() {
    return [
      {
        key: 'nodes',
        responseKey: 'node',
        extendOperations: [
          {
            name: 'updateStatesProvision',
            key: 'states/provision',
            method: 'put',
          },
          {
            name: 'UpdateStatesPower',
            key: 'states/power',
            method: 'put',
          },
          {
            name: 'updateMaintenance',
            key: 'maintenance',
            method: 'put',
          },
          {
            name: 'deleteMaintenance',
            key: 'maintenance',
            method: 'delete',
          },
          {
            name: 'getManagementBootDevice',
            key: 'management/boot_device',
          },
          {
            name: 'updateManagementBootDevice',
            key: 'management/boot_device',
            method: 'put',
          },
          {
            name: 'getManagementBootDeviceSupported',
            key: 'management/boot_device/supported',
          },
          {
            name: 'updateTraits',
            key: 'traits',
            method: 'put',
          },
        ],
        subResources: [
          {
            key: 'states',
          },
          {
            key: 'validate',
          },
          {
            key: 'ports',
          },
          {
            key: 'portgroups',
            responseKey: 'portgroup',
          },
        ],
      },
      {
        key: 'ports',
        responseKey: 'port',
      },
      {
        key: 'portgroups',
        responseKey: 'portgroup',
      },
    ];
  }
}

const ironicClient = new IronicClient();
export default ironicClient;
