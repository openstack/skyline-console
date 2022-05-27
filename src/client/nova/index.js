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
import { novaBase } from '../client/constants';

export class NovaClient extends Base {
  get baseUrl() {
    return novaBase();
  }

  get resources() {
    return [
      {
        key: 'servers',
        responseKey: 'server',
        subResources: [
          {
            name: 'interfaces',
            key: 'os-interface',
          },
          {
            name: 'volumeAttachments',
            key: 'os-volume_attachments',
            responseKey: 'volumeAttachment',
          },
          {
            name: 'instanceActions',
            key: 'os-instance-actions',
            responseKey: 'instanceAction',
          },
          {
            name: 'tags',
            key: 'tags',
            responseKey: 'tag',
          },
        ],
        extendOperations: [
          {
            name: 'createConsole',
            key: 'remote-consoles',
            method: 'post',
          },
          {
            key: 'action',
            method: 'post',
          },
          {
            name: 'updateTags',
            key: 'tags',
            method: 'put',
          },
        ],
      },
      {
        name: 'zone',
        key: 'os-availability-zone',
        responseKey: 'availabilityZoneInfo',
      },
      {
        key: 'flavors',
        responseKey: 'flavor',
        extendOperations: [
          {
            name: 'action',
            key: 'action',
            method: 'post',
          },
        ],
        subResources: [
          {
            name: 'access',
            key: 'os-flavor-access',
          },
          {
            name: 'extraSpecs',
            key: 'os-extra_specs',
          },
        ],
      },
      {
        name: 'keypairs',
        key: 'os-keypairs',
        responseKey: 'keypair',
      },
      {
        name: 'serverGroups',
        key: 'os-server-groups',
        responseKey: 'server_group',
      },
      {
        name: 'aggregates',
        key: 'os-aggregates',
        responseKey: 'aggregate',
        extendOperations: [
          {
            name: 'action',
            key: 'action',
            method: 'post',
          },
        ],
      },
      {
        name: 'services',
        key: 'os-services',
        responseKey: 'service',
      },
      {
        name: 'quotaSets',
        key: 'os-quota-sets',
        responseKey: 'quota_set',
        extendOperations: [
          {
            key: 'detail',
          },
        ],
      },
      {
        name: 'hypervisors',
        key: 'os-hypervisors',
        responseKey: 'hypervisor',
      },
      {
        name: 'pciDevices',
        key: 'os-pci-devices',
        responseKey: 'pci_device',
      },
    ];
  }
}

const novaClient = new NovaClient();
export default novaClient;
