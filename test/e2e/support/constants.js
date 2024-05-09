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

// compute
export const instanceListUrl = '/compute/instance';
export const keypairListUrl = '/compute/keypair';
export const serverGroupListUrl = '/compute/server-group';
export const imageListUrl = '/compute/image';
export const imageListUrlAdmin = '/compute/image-admin';
export const aggregateListUrl = '/compute/aggregates-admin';
export const hypervisorListUrl = '/compute/hypervisors-admin';
export const flavorListUrl = '/compute/flavor-admin';
export const bareMetalListUrl = '/compute/baremetal-node-admin';

// storage
export const volumeListUrl = '/storage/volume';
export const volumeSnapshotListUrl = '/storage/snapshot';
export const backupListUrl = '/storage/backup';
export const volumeTypeListUrl = '/storage/volume-type-admin';
export const storageBackendListUrl = '/storage/storage-admin';
export const containerListUrl = '/storage/container';

// network
export const networkListUrl = '/network/networks';
export const routerListUrl = '/network/router';
export const policyListUrl = '/network/qos-policy-admin';
export const fipListUrl = '/network/floatingip';
export const portListUrl = '/network/port';
export const vpnListUrl = '/network/vpn';
export const lbListUrl = '/network/load-balancers';
export const topologyUrl = '/network/topo';
export const securityGroupListUrl = '/network/security-group';
export const firewallListUrl = '/network/firewall';

// management
export const recycleBinListUrl = '/management/recycle-bin';
export const eventListUrl = '/management/events';

// identity
export const projectListUrl = '/identity/project-admin';
export const userListUrl = '/identity/user-admin';
export const userGroupListUrl = '/identity/user-group-admin';
export const roleListUrl = '/identity/role-admin';
export const domainListUrl = '/identity/domain-admin';

// configuration
export const metadataListUrl = '/configuration-admin/metadata';
export const infoListUrl = '/configuration-admin/info';
export const settingUrl = '/configuration-admin/setting';

// stack
export const stackListUrl = '/heat/stack';

// zun
export const zunContainerListUrl = '/container-service/containers';
export const zunCapsuleListUrl = '/container-service/capsules';

// manila
export const shareTypeListUrl = '/share/share-type-admin';

export default {
  // compute
  instance: instanceListUrl,
  image: imageListUrl,
  flavor: flavorListUrl,

  // storage
  volume: volumeListUrl,
  volumeSnapshot: volumeSnapshotListUrl,
  backup: backupListUrl,
  volumeType: volumeTypeListUrl,

  // network
  network: networkListUrl,
  router: routerListUrl,
  networkQosPolicy: policyListUrl,
  fip: fipListUrl,
  port: portListUrl,
  securityGroup: securityGroupListUrl,
  firewall: firewallListUrl,

  // identity
  project: projectListUrl,
  user: userListUrl,
  userGroup: userGroupListUrl,
};
