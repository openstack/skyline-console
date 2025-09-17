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

import homepageIcon from 'asset/cube/monochrome/home_02.svg';
import computePageIcon from 'asset/cube/monochrome/monitor.svg';
import storagePageIcon from 'asset/cube/monochrome/database.svg';
import networksPageIcon from 'asset/cube/monochrome/networking.svg';
import fileSharePageIcon from 'asset/cube/monochrome/file.svg';
import identityPageIcon from 'asset/cube/monochrome/information_square.svg';
import globalSettingPageIcon from 'asset/cube/monochrome/settings.svg';
import instanceHAPageIcon from 'asset/cube/monochrome/instance.svg';

const renderMenu = (t) => {
  if (!t) {
    return [];
  }
  const menu = [
    {
      path: '/base/overview-admin',
      name: t('Home'),
      key: 'overviewAdmin',
      icon: homepageIcon,
      level: 0,
      hasBreadcrumb: false,
      hasChildren: false,
    },
    {
      path: '/compute',
      name: t('Compute'),
      key: 'computeAdmin',
      icon: computePageIcon,
      children: [
        {
          path: '/compute/instance-admin',
          name: t('Instances'),
          key: 'instanceAdmin',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance-admin\/detail\/.[^/]+$/,
              name: t('Instance Detail'),
              key: 'instanceDetailAdmin',
              routePath: '/compute/instance-admin/detail/:id',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/instance-snapshot-admin',
          name: t('Instance Snapshots'),
          key: 'instanceSnapshotAdmin',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance-snapshot-admin\/detail\/[^/]+$/,
              name: t('Instance Snapshot Detail'),
              key: 'instanceSnapshotDetailAdmin',
              level: 2,
              routePath: '/compute/instance-snapshot-admin/detail/:id',
            },
          ],
        },
        {
          path: '/compute/flavor-admin',
          name: t('Flavors'),
          key: 'flavorAdmin',
          level: 1,
          children: [
            {
              path: '/compute/flavor-admin/create',
              name: t('Create Flavor'),
              key: 'flavorCreateAdmin',
              level: 2,
            },
            {
              path: /^\/compute\/flavor-admin\/detail\/[^/]+$/,
              name: t('Flavor Detail'),
              key: 'flavorDetailAdmin',
              routePath: '/compute/flavor-admin/detail/:id',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/server-group-admin',
          name: t('Server Groups'),
          key: 'serverGroupAdmin',
          level: 1,
          children: [
            {
              path: /^\/compute\/server-group-admin\/detail\/.[^/]+$/,
              name: t('Server Group Detail'),
              key: 'serverGroupDetailAdmin',
              routePath: '/compute/server-group-admin/detail/:id',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/image-admin',
          name: t('Images'),
          key: 'imageAdmin',
          level: 1,
          children: [
            {
              path: /^\/compute\/image-admin\/detail\/.[^/]+$/,
              name: t('Image Detail'),
              key: 'imageDetailAdmin',
              routePath: '/compute/image-admin/detail/:id',
              level: 2,
            },
            {
              path: '/compute/image-admin/create',
              name: t('Create Image'),
              key: 'imageCreateAdmin',
              level: 2,
            },
            {
              path: /^\/compute\/image-admin\/edit\/.([^/]+)$/,
              name: t('Edit Image'),
              key: 'imageEditAdmin',
              routePath: '/compute/image-admin/edit/:id',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/hypervisors-admin',
          name: t('Hypervisors'),
          key: 'hypervisorAdmin',
          level: 1,
          children: [
            {
              path: /^\/compute\/hypervisors-admin\/detail\/.[^/]+$/,
              name: t('Hypervisor Detail'),
              key: 'hypervisorDetailAdmin',
              routePath: '/compute/hypervisors-admin/detail/:id',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/aggregates-admin',
          name: t('Host Aggregates'),
          key: 'aggregateAdmin',
          level: 1,
          children: [],
        },
        {
          path: '/compute/baremetal-node-admin',
          name: t('Bare Metal Nodes'),
          key: 'baremetalNodeAdmin',
          endpoints: 'ironic',
          level: 1,
          children: [
            {
              path: /^\/compute\/baremetal-node-admin\/detail\/.[^/]+$/,
              name: t('Bare Metal Node Detail'),
              key: 'baremetalNodeDetailAdmin',
              routePath: '/compute/baremetal-node-admin/detail/:id',
              level: 2,
            },
            {
              path: /^\/compute\/baremetal-node-admin\/create$/,
              name: t('Create Bare Metal Node'),
              key: 'baremetalNodeCreateAdmin',
              level: 2,
            },
            {
              path: /^\/compute\/baremetal-node-admin\/edit\/.[^/]+$/,
              name: t('Edit Bare Metal Node'),
              key: 'baremetalNodeEditAdmin',
              routePath: '/compute/baremetal-node-admin/detail/:id',
              level: 2,
            },
          ],
        },
      ],
    },
    {
      path: '/storage',
      name: t('Storage'),
      key: 'storageAdmin',
      icon: storagePageIcon,
      children: [
        {
          path: '/storage/volume-admin',
          name: t('Volumes'),
          key: 'volumeAdmin',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/volume-admin\/detail\/.[^/]+$/,
              name: t('Volume Detail'),
              key: 'volumeDetailAdmin',
              level: 2,
              routePath: '/storage/volume-admin/detail/:id',
            },
          ],
        },
        {
          path: '/storage/backup-admin',
          name: t('Volume Backups'),
          key: 'backupAdmin',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/backup-admin\/detail\/.[^/]+$/,
              name: t('Volume Backup Detail'),
              key: 'backupDetailAdmin',
              level: 2,
              routePath: '/storage/backup-admin/detail/:id',
            },
          ],
        },
        {
          path: '/storage/snapshot-admin',
          name: t('Volume Snapshots'),
          key: 'snapshotAdmin',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/snapshot-admin\/detail\/.[^/]+$/,
              name: t('Volume Snapshot Detail'),
              key: 'snapshotDetailAdmin',
              level: 2,
              routePath: '/storage/snapshot-admin/detail/:id',
            },
          ],
        },
        {
          path: '/storage/volume-type-admin',
          name: t('Volume Types'),
          key: 'volumeTypeAdmin',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/volume-type-admin\/detail\/.[^/]+$/,
              name: t('Volume Type Detail'),
              key: 'volumeTypeDetailAdmin',
              level: 2,
              routePath: '/storage/volume-type-admin/detail/:id',
            },
            {
              path: /^\/storage\/volume-type-admin\/qos\/detail\/.[^/]+$/,
              name: t('QoS Detail'),
              key: 'volumeTypeQosDetailAdmin',
              level: 2,
              routePath: '/storage/volume-type-admin/qos/detail/:id',
            },
          ],
        },
        {
          path: '/storage/storage-admin',
          name: t('Storage Backends'),
          key: 'storageBackendAdmin',
          level: 1,
          endpoints: 'cinder',
          children: [],
        },
      ],
    },
    {
      path: '/network',
      name: t('Network'),
      key: '/networkAdmin',
      icon: networksPageIcon,
      children: [
        {
          path: '/network/networks-admin',
          name: t('Networks'),
          key: 'networkAdmin',
          level: 1,
          children: [
            {
              path: /^\/network\/networks-admin\/detail\/.[^/]+$/,
              name: t('Network Detail'),
              key: 'networkDetailAdmin',
              level: 2,
              routePath: '/network/networks-admin/detail/:id',
            },
            {
              path: /^\/network\/networks-admin\/detail\/.[^/]+\/subnet\/.[^/]+$/,
              name: t('Subnet Detail'),
              key: 'subnetDetailAdmin',
              level: 2,
              routePath: '/network/networks-admin/detail/:networkId/subnet/:id',
            },
          ],
        },
        {
          path: '/network/port-admin',
          name: t('Ports'),
          key: 'port',
          level: 1,
          children: [
            {
              path: /^\/network\/port-admin\/detail\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'portDetailAdmin',
              level: 2,
              routePath: '/network/port-admin/detail/:id',
            },
            {
              path: /^\/network\/networks-admin\/detail\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'networkPortDetailAdmin',
              level: 2,
              routePath: '/network/networks-admin/detail/:networkId/port/:id',
            },
            {
              path: /^\/network\/networks-admin\/detail\/.[^/]+\/subnet\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'subnetPortDetailAdmin',
              level: 2,
              routePath:
                '/network/networks-admin/detail/:networkId/subnet/:subnetId/port/:id',
            },
            {
              path: /^\/network\/instance-admin\/detail\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'instancePortDetailAdmin',
              level: 2,
              routePath: '/network/instance-admin/detail/:instanceId/port/:id',
            },
          ],
        },
        {
          path: '/network/qos-policy-admin',
          name: t('QoS Policies'),
          key: 'networkQosAdmin',
          endpoints: 'neutron_qos',
          level: 1,
          children: [
            {
              path: /^\/network\/qos-policy-admin\/detail\/.[^/]+$/,
              name: t('QoS Policy Detail'),
              key: 'networkQosDetailAdmin',
              level: 2,
              routePath: '/network/qos-policy-admin/detail/:id',
            },
          ],
        },
        {
          path: '/network/router-admin',
          name: t('Routers'),
          key: 'routerAdmin',
          level: 1,
          children: [
            {
              path: /^\/network\/router-admin\/detail\/.[^/]+$/,
              name: t('Router Detail'),
              key: 'routerDetailAdmin',
              level: 2,
              routePath: '/network/router-admin/detail/:id',
            },
            {
              path: /^\/network\/router-admin\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'routerPortDetailAdmin',
              level: 2,
              routePath: '/network/router-admin/:routerId/port/:id',
            },
          ],
        },
        {
          path: '/network/floatingip-admin',
          name: t('Floating IPs'),
          key: 'fipAdmin',
          level: 1,
          children: [
            {
              path: /^\/network\/floatingip-admin\/detail\/.[^/]+$/,
              name: t('Floating Ip Detail'),
              key: 'fipDetailAdmin',
              level: 2,
              routePath: '/network/floatingip-admin/detail/:id',
            },
          ],
        },
        {
          path: '/network/load-balancers-admin',
          name: t('Load Balancers'),
          key: 'lbAdmin',
          endpoints: 'octavia',
          level: 1,
          children: [
            {
              path: /^\/network\/load-balancers-admin\/detail\/.[^/]+$/,
              name: t('Load Balancer Detail'),
              key: 'lbDetailAdmin',
              level: 2,
              routePath: '/network/load-balancers-admin/detail/:id',
            },
            {
              path: /^\/network\/load-balancers-admin\/.[^/]+\/listener\/.[^/]+$/,
              name: t('Listener Detail'),
              key: 'lbListenerDetailAdmin',
              level: 2,
              routePath:
                '/network/load-balancers-admin/:loadBalancerId/listener/:id',
            },
          ],
        },
        {
          path: '/network/vpn-admin',
          name: t('VPNs'),
          key: 'vpnAdmin',
          endpoints: 'neutron_vpn',
          level: 1,
          children: [
            {
              path: /^\/network\/ipsec-site-connection-admin\/detail\/.[^/]+$/,
              name: t('IPsec site connection Detail'),
              key: 'ipsecDetailAdmin',
              level: 2,
              routePath: '/network/ipsec-site-connection-admin/detail/:id',
            },
          ],
        },
        {
          path: '/network/security-group-admin',
          name: t('Security Groups'),
          key: 'securityGroupAdmin',
          level: 1,
          children: [
            {
              path: /^\/network\/security-group-admin\/detail\/.[^/]+$/,
              name: t('Security Group Detail'),
              key: 'securityGroupDetailAdmin',
              level: 2,
              routePath: '/network/security-group-admin/detail/:id',
            },
          ],
        },
        {
          path: '/network/firewall-admin',
          name: t('Firewalls'),
          key: 'firewallAdmin',
          level: 1,
          endpoints: 'neutron_firewall',
          children: [
            {
              path: /^\/network\/firewall-policy-admin\/detail\/[^/]+$/,
              name: t('Policy Detail'),
              key: 'firewallPolicyDetailAdmin',
              level: 2,
              routePath: '/network/firewall-policy-admin/detail/:id',
            },
            {
              path: /^\/network\/firewall-admin\/[^/]+\/port\/[^/]+$/,
              name: t('Firewall Port'),
              key: 'firewallPortDetailAdmin',
              level: 2,
              routePath: '/network/firewall-admin/:firewallId/port/:portId',
            },
            {
              path: /^\/network\/firewall-admin\/detail\/[^/]+$/,
              name: t('Firewall Detail'),
              key: 'firewallDetailAdmin',
              level: 2,
              routePath: '/network/firewall-admin/detail/:id',
            },
            {
              path: /^\/network\/firewall-rule-admin\/detail\/[^/]+$/,
              name: t('Rule Detail'),
              key: 'firewallRuleDetailAdmin',
              level: 2,
              routePath: '/network/firewall-rule-admin/detail/:id',
            },
          ],
        },
        {
          path: '/network/dns-admin/zones',
          name: t('DNS Zones'),
          key: 'dnsZonesAdmin',
          endpoints: 'designate',
          level: 1,
          children: [
            {
              path: /^\/network\/dns-admin\/zones\/detail\/.[^/]+$/,
              name: t('Zones Detail'),
              key: 'dnsZonesDetailAdmin',
              level: 2,
              routePath: '/network/dns-admin/zones/detail/:id',
            },
            {
              path: /^\/network\/dns-admin\/zones\/detail\/.[^/]+\/recordsets\/.[^/]+$/,
              name: t('Recordsets Detail'),
              key: 'dnsRecordSetDetailAdmin',
              level: 2,
              routePath:
                '/network/dns-admin/zones/detail/:zoneId/recordsets/:id',
            },
          ],
        },
      ],
    },
    {
      path: '/share',
      name: t('Share File Storage'),
      key: 'fileStorageAdmin',
      endpoints: 'manilav2',
      icon: fileSharePageIcon,
      children: [
        {
          path: '/share/share-admin',
          name: t('Shares'),
          key: 'shareAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-admin\/detail\/.[^/]+$/,
              name: t('Share Detail'),
              key: 'shareDetailAdmin',
              level: 2,
              routePath: '/share/share-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-type-admin',
          name: t('Share Types'),
          key: 'shareTypeAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-type-admin\/detail\/.[^/]+$/,
              name: t('Share Type Detail'),
              key: 'shareTypeDetailAdmin',
              level: 2,
              routePath: '/share/share-type-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-group-type-admin',
          name: t('Share Group Types'),
          key: 'shareGroupTypeAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-group-type-admin\/detail\/.[^/]+$/,
              name: t('Share Group Type Detail'),
              key: 'shareGroupTypeDetailAdmin',
              level: 2,
              routePath: '/share/share-group-type-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-network-admin',
          name: t('Share Networks'),
          key: 'shareNetworkAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-network-admin\/detail\/.[^/]+$/,
              name: t('Share Network Detail'),
              key: 'shareNetworkDetailAdmin',
              level: 2,
              routePath: '/share/share-network-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-server-admin',
          name: t('Share Servers'),
          key: 'shareServerAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-server-admin\/detail\/.[^/]+$/,
              name: t('Share Server Detail'),
              key: 'shareServerDetailAdmin',
              level: 2,
              routePath: '/share/share-server-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-instance-admin',
          name: t('Share Instances'),
          key: 'shareInstanceAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-instance-admin\/detail\/.[^/]+$/,
              name: t('Share Instance Detail'),
              key: 'shareInstanceDetailAdmin',
              level: 2,
              routePath: '/share/share-instance-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-group-admin',
          name: t('Share Groups'),
          key: 'shareGroupAdmin',
          level: 1,
          children: [
            {
              path: /^\/share\/share-group-admin\/detail\/.[^/]+$/,
              name: t('Share Group Detail'),
              key: 'shareGroupDetailAdmin',
              level: 2,
              routePath: '/share/share-group-admin/detail/:id',
            },
          ],
        },
        {
          path: '/share/storage-admin',
          name: t('Storage Backends'),
          key: 'shareStorageBackendAdmin',
          level: 1,
          children: [],
        },
      ],
    },
    {
      path: '/identity',
      name: t('Identity'),
      key: '/identity',
      icon: identityPageIcon,
      children: [
        {
          path: '/identity/domain-admin',
          name: t('Domains'),
          key: 'domainAdmin',
          level: 1,
          children: [
            {
              path: /^\/identity\/domain-admin\/detail\/.[^/]+$/,
              name: t('Domain Detail'),
              key: 'domainDetailAdmin',
              level: 2,
              routePath: '/identity/domain-admin/detail/:id',
            },
          ],
        },
        {
          path: '/identity/project-admin',
          name: t('Projects'),
          key: 'projectAdmin',
          level: 1,
          children: [
            {
              path: /^\/identity\/project-admin\/detail\/.[^/]+$/,
              name: t('Project Detail'),
              key: 'projectDetailAdmin',
              level: 2,
              routePath: '/identity/project-admin/detail/:id',
            },
            {
              path: '/identity/project-admin/create',
              name: t('Create Project'),
              key: 'projectCreateAdmin',
              level: 2,
            },
            {
              path: /^\/identity\/project-admin\/edit\/.[^/]+$/,
              name: t('Edit Project'),
              key: 'projectEditAdmin',
              level: 2,
              routePath: '/identity/project-admin/edit/:id',
            },
          ],
        },
        {
          path: '/identity/user-admin',
          name: t('Users'),
          key: 'userAdmin',
          level: 1,
          children: [
            {
              path: /^\/identity\/user-admin\/detail\/.[^/]+$/,
              name: t('User Detail'),
              key: 'userDetailAdmin',
              level: 2,
              routePath: '/identity/user-admin/detail/:id',
            },
            {
              path: '/identity/user-admin/create',
              name: t('Create User'),
              key: 'userCreateAdmin',
              level: 2,
            },
            {
              path: /^\/identity\/user-admin\/edit\/.[^/]+$/,
              name: t('User Edit'),
              key: 'userEditAdmin',
              level: 2,
              routePath: '/identity/user-admin/edit/:id',
            },
          ],
        },
        {
          path: '/identity/user-group-admin',
          name: t('User Groups'),
          key: 'userGroupAdmin',
          level: 1,
          children: [
            {
              path: /^\/identity\/user-group-admin\/detail\/.[^/]+$/,
              name: t('User Group Detail'),
              key: 'userGroupDetailAdmin',
              level: 2,
              routePath: '/identity/user-group-admin/detail/:id',
            },
            {
              path: '/identity/user-group-admin/create',
              name: t('Create User Group'),
              key: 'userGroupCreateAdmin',
              level: 2,
            },
            {
              path: /^\/identity\/user-group-admin\/edit\/.[^/]+$/,
              name: t('Edit User Group'),
              key: 'userGroupEditAdmin',
              level: 2,
              routePath: '/identity/user-group-admin/edit/:id',
            },
          ],
        },
        {
          path: '/identity/role-admin',
          name: t('Roles'),
          key: 'roleAdmin',
          level: 1,
          children: [
            {
              path: /^\/identity\/role-admin\/detail\/.[^/]+$/,
              name: t('Role Detail'),
              key: 'roleDetailAdmin',
              level: 2,
              routePath: '/identity/role-admin/detail/:id',
            },
          ],
        },
      ],
    },
    // {
    //   path: '/management',
    //   name: t('Maintenance'),
    //   key: '/management',
    //   icon: <ToolOutlined />,
    //   children: [
    //     {
    //       path: '/management/recycle-bin-admin',
    //       name: t('Recycle Bin'),
    //       key: 'recycleBinAdmin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/management\/recycle-bin-admin\/detail\/.[^/]+$/,
    //           name: t('Instance Detail'),
    //           key: 'recycleBinDetailAdmin',
    //           level: 2,
    //           routePath: '/management/recycle-bin-admin/detail/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },

    // remove heat menu in the administrator,
    // because the heat api has a problem with the permission determination
    // of the scope.system.all=true level.
    // {
    //   path: '/heat',
    //   name: t('Orchestration'),
    //   key: 'heatAdmin',
    //   endpoints: 'heat',
    //   icon: <AppstoreOutlined />,
    //   children: [
    //     {
    //       path: '/heat/stack-admin',
    //       name: t('Stacks'),
    //       key: 'stackAdmin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/heat\/stack-admin\/detail\/.[^/]+\/.[^/]+$/,
    //           name: t('Stack Detail'),
    //           key: 'stackDetailAdmin',
    //           level: 2,
    //           routePath: '/heat/stack-admin/detail/:id/:name',
    //         },
    //         {
    //           path: '/heat/stack-admin/create',
    //           name: t('Create Stack'),
    //           key: 'stackCreateAdmin',
    //           level: 2,
    //         },
    //         {
    //           path: /^\/heat\/stack-admin\/edit\/.[^/]+\/.[^/]+$/,
    //           name: t('Update Template'),
    //           key: 'stackEditAdmin',
    //           level: 2,
    //           routePath: '/heat/stack-admin/edit/:id/:name',
    //         },
    //       ],
    //     },
    //   ],
    // },

    // {
    //   path: '/database',
    //   name: t('Database'),
    //   key: 'databaseAdmin',
    //   endpoints: 'trove',
    //   icon: <DatabaseFilled />,
    //   children: [
    //     {
    //       path: '/database/instances-admin',
    //       name: t('Database Instances'),
    //       key: 'databaseInstancesAdmin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/database\/instances-admin\/detail\/.[^/]+$/,
    //           name: t('Database Instance Detail'),
    //           key: 'databaseInstanceDetailAdmin',
    //           level: 2,
    //           routePath: '/database/instances-admin/detail/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },

    // {
    //   path: '/monitor-center',
    //   name: t('Monitor Center'),
    //   key: '/monitorCenterAdmin',
    //   icon: <MonitorOutlined />,
    //   children: [
    //     {
    //       path: '/monitor-center/overview-admin',
    //       name: t('Monitor Overview'),
    //       key: 'monitorOverviewAdmin',
    //       level: 1,
    //       children: [],
    //       hasBreadcrumb: true,
    //     },
    //     {
    //       path: '/monitor-center/physical-node-admin',
    //       name: t('Physical Nodes'),
    //       key: 'monitorPhysicalNodeAdmin',
    //       level: 1,
    //       children: [],
    //       hasBreadcrumb: true,
    //     },
    //     {
    //       path: '/monitor-center/storage-cluster-admin',
    //       name: t('Storage Clusters'),
    //       key: 'monitorStorageClusterAdmin',
    //       level: 1,
    //       children: [],
    //       hasBreadcrumb: true,
    //     },
    //     {
    //       path: '/monitor-center/openstack-service-admin',
    //       name: t('OpenStack Services'),
    //       key: 'monitorOpenstackServiceAdmin',
    //       level: 1,
    //       children: [],
    //       hasBreadcrumb: true,
    //     },
    //     {
    //       path: '/monitor-center/other-service-admin',
    //       name: t('Other Services'),
    //       key: 'monitorOtherServiceAdmin',
    //       level: 1,
    //       children: [],
    //       hasBreadcrumb: true,
    //     },
    //   ],
    // },
    {
      path: '/configuration-admin',
      name: t('Global Setting'),
      key: 'configurationAdmin',
      icon: globalSettingPageIcon,
      children: [
        {
          path: '/configuration-admin/info',
          name: t('System Info'),
          key: 'systemInfoAdmin',
          level: 1,
          children: [
            {
              path: /^\/configuration-admin\/neutron\/detail\/.[^/]+$/,
              name: t('Neutron Agent Detail'),
              key: 'neutronAgentDetailAdmin',
              level: 2,
              routePath: '/configuration-admin/neutron/detail/:id',
            },
          ],
        },
        {
          path: '/configuration-admin/setting',
          name: t('System Config'),
          key: 'settingAdmin',
          level: 1,
        },
        {
          path: '/configuration-admin/metadata',
          name: t('Metadata Definitions'),
          key: 'metadataAdmin',
          level: 1,
          children: [
            {
              path: /^\/configuration-admin\/metadata\/detail\/.[^/]+$/,
              name: t('Metadata Detail'),
              key: 'metadataDetailAdmin',
              level: 2,
              routePath: '/configuration-admin/metadata/detail/:id',
            },
          ],
        },
      ],
    },
    // {
    //   path: '/container',
    //   name: t('Container'),
    //   key: 'containerAdmin',
    //   icon: <ContainerOutlined />,
    //   children: [
    //     {
    //       path: '/container-service/containers-admin',
    //       name: t('Containers'),
    //       key: 'zunContainersAdmin',
    //       endpoints: 'zun',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-service\/containers-admin\/detail\/.[^/]+$/,
    //           name: t('Container Detail'),
    //           key: 'zunContainerDetailAdmin',
    //           level: 2,
    //           routePath: '/container-service/containers-admin/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-service/hosts-admin',
    //       name: t('Hosts'),
    //       key: 'zunHostsAdmin',
    //       endpoints: 'zun',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-service\/hosts-admin\/detail\/.[^/]+$/,
    //           name: t('Host Detail'),
    //           key: 'zuHostsDetailAdmin',
    //           level: 2,
    //           routePath: '/container-service/hosts-admin/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-service/services-admin',
    //       name: t('Services'),
    //       key: 'zunServicesAdmin',
    //       endpoints: 'zun',
    //       level: 1,
    //     },
    //     {
    //       path: '/container-infra/clusters-admin',
    //       name: t('Clusters'),
    //       key: 'containerInfraClustersAdmin',
    //       endpoints: 'magnum',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-infra\/clusters-admin\/detail\/.[^/]+$/,
    //           name: t('Cluster Detail'),
    //           key: 'containerInfraClusterDetailAdmin',
    //           level: 2,
    //           routePath: '/container-infra/clusters-admin/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-infra/cluster-template-admin',
    //       name: t('Cluster Templates'),
    //       key: 'clusterTemplateAdmin',
    //       endpoints: 'magnum',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-infra\/cluster-template-admin\/detail\/.[^/]+$/,
    //           name: t('Cluster Template Detail'),
    //           key: 'containerInfraClusterTemplateDetailAdmin',
    //           level: 2,
    //           routePath: '/container-infra/cluster-template-admin/detail/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      path: '/ha',
      name: t('Instance-HA'),
      key: 'masakari',
      icon: instanceHAPageIcon,
      endpoints: 'masakari',
      children: [
        {
          path: '/ha/segments-admin',
          name: t('Segments'),
          key: 'masakariSegmentsAdmin',
          level: 1,
          children: [
            {
              path: '/ha/segments-admin/create-step-admin',
              name: t('Create Segment'),
              key: 'masakariSegmentsCreateAdmin',
              level: 2,
            },
            {
              path: /^\/ha\/segments-admin\/detail\/.[^/]+$/,
              name: t('Segment Detail'),
              key: 'masakariSegmentDetailAdmin',
              level: 2,
              routePath: '/ha/segments-admin/detail/:id',
            },
          ],
        },
        {
          path: '/ha/hosts-admin',
          name: t('Hosts'),
          key: 'masakariHostsAdmin',
          level: 1,
          children: [
            {
              path: /^\/ha\/hosts-admin\/detail\/.[^/]+$/,
              name: t('Host Detail'),
              key: 'masakariHostDetailAdmin',
              level: 2,
              routePath: '/ha/hosts-admin/detail/:id',
            },
          ],
        },
        {
          path: '/ha/notifications-admin',
          name: t('Notifications'),
          key: 'masakariNotificationsAdmin',
          level: 1,
          children: [
            {
              path: /^\/ha\/notifications-admin\/detail\/.[^/]+$/,
              name: t('Notification Detail'),
              key: 'masakariNotificationDetailAdmin',
              level: 2,
              routePath: '/ha/notifications-admin/detail/:id',
            },
          ],
        },
      ],
    },
  ];
  return menu;
};

export default renderMenu;
