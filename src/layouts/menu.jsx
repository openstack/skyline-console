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
import orchestrationPageIcon from 'asset/cube/monochrome/integration.svg';

const renderMenu = (t) => {
  if (!t) {
    return [];
  }
  const menu = [
    {
      path: '/base/overview',
      name: t('Home'),
      key: 'overview',
      icon: homepageIcon,
      level: 0,
      hasBreadcrumb: false,
      hasChildren: false,
    },
    {
      path: '/compute',
      name: t('Compute'),
      key: 'compute',
      icon: computePageIcon,
      children: [
        {
          path: '/compute/instance',
          name: t('Instances'),
          key: 'instance',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance\/detail\/.[^/]+$/,
              name: t('Instance Detail'),
              key: 'instanceDetail',
              level: 2,
              routePath: '/compute/instance/detail/:id',
            },
            {
              path: '/compute/instance/create',
              name: t('Create Instance'),
              key: 'instanceCreate',
              level: 2,
            },
            {
              path: '/compute/ironic-instance/create',
              name: t('Create Ironic Instance'),
              key: 'ironicCreate',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/instance-snapshot',
          name: t('Instance Snapshots'),
          key: 'instanceSnapshot',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance-snapshot\/detail\/[^/]+$/,
              name: t('Instance Snapshot Detail'),
              key: 'instanceSnapshotDetail',
              level: 2,
              routePath: '/compute/instance-snapshot/detail/:id',
            },
          ],
        },
        {
          path: '/compute/flavor',
          name: t('Flavors'),
          key: 'flavor',
          level: 1,
          children: [
            {
              path: /^\/compute\/flavor\/detail\/.[^/]+$/,
              name: t('Flavor Detail'),
              key: 'flavorDetail',
              level: 2,
              routePath: '/compute/flavor/detail/:id',
            },
          ],
        },
        {
          path: '/compute/server-group',
          name: t('Server Groups'),
          key: 'serverGroup',
          level: 1,
          children: [
            {
              path: /^\/compute\/server-group\/detail\/.[^/]+$/,
              name: t('Server Group Detail'),
              key: 'serverGroupDetail',
              level: 2,
              routePath: '/compute/server-group/detail/:id',
            },
          ],
        },
        {
          path: '/compute/image',
          name: t('Images'),
          key: 'image',
          level: 1,
          children: [
            {
              path: /^\/compute\/image\/detail\/.[^/]+$/,
              name: t('Image Detail'),
              key: 'imageDetail',
              level: 2,
              routePath: '/compute/image/detail/:id',
            },
            {
              path: '/compute/image/create',
              name: t('Create Image'),
              key: 'imageCreate',
              level: 2,
            },
            {
              path: /^\/compute\/image\/edit\/.([^/]+)$/,
              name: t('Edit Image'),
              key: 'imageEdit',
              level: 2,
              routePath: '/compute/image/edit/:id',
            },
          ],
        },
        {
          path: '/compute/keypair',
          name: t('Key Pairs'),
          key: 'keypair',
          level: 1,
          children: [
            {
              path: /^\/compute\/keypair\/detail\/.[^/]*$/,
              name: t('Keypair Detail'),
              key: 'keypairDetail',
              level: 2,
              routePath: '/compute/keypair/detail/:id',
            },
          ],
        },
      ],
    },
    {
      path: '/storage',
      name: t('Storage'),
      key: 'storage',
      icon: storagePageIcon,
      children: [
        {
          path: '/storage/volume',
          name: t('Volumes'),
          key: 'volume',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: '/storage/volume/create',
              name: t('Create Volume'),
              key: 'volumeCreate',
              level: 2,
            },
            {
              path: /^\/storage\/volume\/detail\/.[^/]+$/,
              name: t('Volume Detail'),
              key: 'volumeDetail',
              level: 2,
              routePath: '/storage/volume/detail/:id',
            },
          ],
        },
        {
          path: '/storage/backup',
          name: t('Volume Backups'),
          key: 'backup',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/backup\/detail\/.[^/]+$/,
              name: t('Volume Backup Detail'),
              key: 'backupDetail',
              level: 2,
              routePath: '/storage/backup/detail/:id',
            },
          ],
        },
        {
          path: '/storage/snapshot',
          name: t('Volume Snapshots'),
          key: 'snapshot',
          level: 1,
          endpoints: 'cinder',
          children: [
            {
              path: /^\/storage\/snapshot\/detail\/.[^/]+$/,
              name: t('Volume Snapshot Detail'),
              key: 'snapshotDetail',
              level: 2,
              routePath: '/storage/snapshot/detail/:id',
            },
          ],
        },
        {
          path: '/storage/container',
          name: t('Object Storage'),
          key: 'containers',
          endpoints: 'swift',
          level: 1,
          children: [
            {
              path: /^\/storage\/container\/detail\/[^/]+$/,
              name: t('Container Detail'),
              key: 'containerDetail',
              level: 2,
              routePath: '/storage/container/detail/:id',
            },
            {
              path: /^\/storage\/container\/detail\/[^/]+\/.+$/,
              name: t('Folder Detail'),
              key: 'folderDetail',
              level: 2,
              routePath: '/storage/container/detail/:container/:folder',
            },
          ],
        },
      ],
    },
    {
      path: '/network',
      name: t('Network'),
      key: '/network',
      icon: networksPageIcon,
      children: [
        {
          path: '/network/networks',
          name: t('Networks'),
          key: 'network',
          level: 1,
          children: [
            {
              path: /^\/network\/networks\/detail\/.[^/]+$/,
              name: t('Network Detail'),
              key: 'networkDetail',
              level: 2,
              routePath: '/network/networks/detail/:id',
            },
            {
              path: /^\/network\/networks\/detail\/.[^/]+\/subnet\/.[^/]+$/,
              name: t('Subnet Detail'),
              key: 'subnetDetail',
              level: 2,
              routePath: '/network/networks/detail/:networkId/subnet/:id',
            },
          ],
        },
        {
          path: '/network/port',
          name: t('Ports'),
          key: 'port',
          level: 1,
          children: [
            {
              path: /^\/network\/port\/detail\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'portDetail',
              level: 2,
              routePath: '/network/port/detail/:id',
            },
            {
              path: /^\/network\/networks\/detail\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'networkPortDetail',
              level: 2,
              routePath: '/network/networks/detail/:networkId/port/:id',
            },
            {
              path: /^\/network\/networks\/detail\/.[^/]+\/subnet\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'subnetPortDetail',
              level: 2,
              routePath:
                '/network/networks/detail/:networkId/subnet/:subnetId/port/:id',
            },
            {
              path: /^\/network\/instance\/detail\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'instancePortDetail',
              level: 2,
              routePath: '/network/instance/detail/:instanceId/port/:id',
            },
          ],
        },
        {
          path: '/network/qos-policy',
          name: t('QoS Policies'),
          key: 'networkQos',
          endpoints: 'neutron_qos',
          level: 1,
          children: [
            {
              path: /^\/network\/qos-policy\/detail\/.[^/]+$/,
              name: t('QoS Policy Detail'),
              key: 'networkQosDetail',
              level: 2,
              routePath: '/network/qos-policy/detail/:id',
            },
          ],
        },
        {
          path: '/network/router',
          name: t('Routers'),
          key: 'router',
          level: 1,
          children: [
            {
              path: /^\/network\/router\/detail\/.[^/]+$/,
              name: t('Router Detail'),
              key: 'routerDetail',
              level: 2,
              routePath: '/network/router/detail/:id',
            },
            {
              path: /^\/network\/router\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'routerPortDetail',
              level: 2,
              routePath: '/network/router/:routerId/port/:id',
            },
          ],
        },
        {
          path: '/network/floatingip',
          name: t('Floating IPs'),
          key: 'fip',
          level: 1,
          children: [
            {
              path: /^\/network\/floatingip\/detail\/.[^/]+$/,
              name: t('Floating Ip Detail'),
              key: 'fipDetail',
              level: 2,
              routePath: '/network/floatingip/detail/:id',
            },
          ],
        },
        {
          path: '/network/topo',
          name: t('Topology'),
          key: 'networkTopo',
          level: 1,
          children: [],
        },
        {
          path: '/network/load-balancers',
          name: t('Load Balancers'),
          key: 'lb',
          endpoints: 'octavia',
          level: 1,
          children: [
            {
              path: '/network/load-balancers/create',
              name: t('Create Loadbalancer'),
              key: 'lbCreate',
              level: 2,
            },
            {
              path: /^\/network\/load-balancers\/detail\/.[^/]+$/,
              name: t('Load Balancer Detail'),
              key: 'lbDetail',
              level: 2,
              routePath: '/network/load-balancers/detail/:id',
            },
            {
              path: /^\/network\/load-balancers\/.[^/]+\/listener\/.[^/]+$/,
              name: t('Listener Detail'),
              key: 'lbListenerDetail',
              level: 2,
              routePath: '/network/load-balancers/:loadBalancerId/listener/:id',
            },
          ],
        },
        {
          path: '/network/certificate',
          name: t('Certificates'),
          key: 'certificate',
          endpoints: 'barbican',
          level: 1,
          children: [
            {
              path: /^\/network\/certificate-container\/detail\/.[^/]+$/,
              name: t('Certificate Detail'),
              key: 'certificateContainerDetail',
              level: 2,
              routePath: '/network/certificate-container/detail/:id',
            },
            {
              path: /^\/network\/certificate-secret\/detail\/.[^/]+$/,
              name: t('Certificate Detail'),
              key: 'certificateSecretDetail',
              level: 2,
              routePath: '/network/certificate-secret/detail/:id',
            },
          ],
        },
        {
          path: '/network/vpn',
          name: t('VPNs'),
          key: 'vpn',
          endpoints: 'neutron_vpn',
          level: 1,
          children: [
            {
              path: /^\/network\/ipsec-site-connection\/detail\/.[^/]+$/,
              name: t('IPsec site connection Detail'),
              key: 'ipsecDetail',
              level: 2,
              routePath: '/network/ipsec-site-connection/detail/:id',
            },
          ],
        },
        {
          path: '/network/security-group',
          name: t('Security Groups'),
          key: 'securityGroup',
          level: 1,
          children: [
            {
              path: /^\/network\/security-group\/detail\/.[^/]+$/,
              name: t('Security Group Detail'),
              key: 'securityGroupDetail',
              level: 2,
              routePath: '/network/security-group/detail/:id',
            },
          ],
        },
        {
          path: '/network/firewall',
          name: t('Firewalls'),
          key: 'firewall',
          level: 1,
          endpoints: 'neutron_firewall',
          children: [
            {
              path: /^\/network\/firewall-policy\/detail\/[^/]+$/,
              name: t('Policy Detail'),
              key: 'firewallPolicyDetail',
              level: 2,
              routePath: '/network/firewall-policy/detail/:id',
            },
            {
              path: '/network/firewall-rule/create',
              name: t('Create Rule'),
              key: 'firewallRuleCreate',
              level: 2,
            },
            {
              path: '/network/firewall-policy/add',
              name: t('Add Policy'),
              key: 'firewallPolicyCreate',
              level: 2,
            },
            {
              path: '/network/firewall/create',
              name: t('Create Firewall'),
              key: 'firewallCreate',
              level: 2,
            },
            {
              path: /^\/network\/firewall\/[^/]+\/port\/[^/]+$/,
              name: t('Firewall Port'),
              key: 'firewallPortDetail',
              level: 2,
              routePath: '/network/firewall/:firewallId/port/:portId',
            },
            {
              path: /^\/network\/firewall-rule\/edit\/[^/]+$/,
              name: t('Rule Edit'),
              key: 'firewallRuleEdit',
              level: 2,
              routePath: '/network/firewall-rule/edit/:id',
            },
            {
              path: /^\/network\/firewall\/detail\/[^/]+$/,
              name: t('Firewall Detail'),
              key: 'firewallDetail',
              level: 2,
              routePath: '/network/firewall/detail/:id',
            },
            {
              path: /^\/network\/firewall-rule\/detail\/[^/]+$/,
              name: t('Rule Detail'),
              key: 'firewallRuleDetail',
              level: 2,
              routePath: '/network/firewall-rule/detail/:id',
            },
            {
              path: /^\/network\/firewall-policy\/edit\/[^/]+$/,
              name: t('Policy Edit'),
              key: 'firewallPolicyEdit',
              level: 2,
              routePath: '/network/firewall-policy/edit/:id',
            },
          ],
        },
        {
          path: '/network/dns/zones',
          name: t('DNS Zones'),
          key: 'dnsZones',
          endpoints: 'designate',
          level: 1,
          children: [
            {
              path: /^\/network\/dns\/zones\/detail\/.[^/]+$/,
              name: t('Zones Detail'),
              key: 'dnsZonesDetail',
              level: 2,
              routePath: '/network/dns/zones/detail/:id',
            },
            {
              path: /^\/network\/dns\/zones\/detail\/.[^/]+\/recordsets\/.[^/]+$/,
              name: t('Recordsets Detail'),
              key: 'dnsRecordSetDetail',
              level: 2,
              routePath: '/network/dns/zones/detail/:zoneId/recordsets/:id',
            },
          ],
        },
        {
          path: '/network/dns/reverse',
          name: t('DNS Reverse'),
          key: 'dnsReverse',
          endpoints: 'designate',
          level: 1,
          children: [
            {
              path: /^\/network\/dns\/reverse\/detail\/.[^/]+$/,
              name: t('Reverse DNS Detail'),
              key: 'dnsReverseDetail',
              level: 2,
              routePath: '/network/dns/reverse/detail/:id',
            },
          ],
        },
      ],
    },
    {
      path: '/share',
      name: t('Share File Storage'),
      key: 'fileStorage',
      endpoints: 'manilav2',
      icon: fileSharePageIcon,
      children: [
        {
          path: '/share/share',
          name: t('Shares'),
          key: 'share',
          level: 1,
          children: [
            {
              path: /^\/share\/share\/detail\/.[^/]+$/,
              name: t('Share Detail'),
              key: 'shareDetail',
              level: 2,
              routePath: '/share/share/detail/:id',
            },
            {
              path: '/share/share/create',
              name: t('Create Share'),
              key: 'shareCreate',
              level: 2,
            },
          ],
        },
        {
          path: '/share/share-network',
          name: t('Share Networks'),
          key: 'shareNetwork',
          level: 1,
          children: [
            {
              path: /^\/share\/share-network\/detail\/.[^/]+$/,
              name: t('Share Network Detail'),
              key: 'shareNetworkDetail',
              level: 2,
              routePath: '/share/share-network/detail/:id',
            },
          ],
        },
        {
          path: '/share/share-group',
          name: t('Share Groups'),
          key: 'shareGroup',
          level: 1,
          children: [
            {
              path: /^\/share\/share-group\/detail\/.[^/]+$/,
              name: t('Share Group Detail'),
              key: 'shareGroupDetail',
              level: 2,
              routePath: '/share/share-group/detail/:id',
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
    //       path: '/management/recycle-bin',
    //       name: t('Recycle Bin'),
    //       key: 'recycleBin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/management\/recycle-bin\/detail\/.[^/]+$/,
    //           name: t('Instance Detail'),
    //           key: 'recycleBinDetail',
    //           level: 2,
    //           routePath: '/management/recycle-bin/detail/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      path: '/heat',
      name: t('Orchestration'),
      key: 'heat',
      endpoints: 'heat',
      icon: orchestrationPageIcon,
      children: [
        {
          path: '/heat/stack',
          name: t('Stacks'),
          key: 'stack',
          level: 1,
          children: [
            {
              path: /^\/heat\/stack\/detail\/.[^/]+\/.[^/]+$/,
              name: t('Stack Detail'),
              key: 'stackDetail',
              level: 2,
              routePath: '/heat/stack/detail/:id/:name',
            },
            {
              path: '/heat/stack/create',
              name: t('Create Stack'),
              key: 'stackCreate',
              level: 2,
            },
            {
              path: /^\/heat\/stack\/edit\/.[^/]+\/.[^/]+$/,
              name: t('Update Template'),
              key: 'stackEdit',
              level: 2,
              routePath: '/heat/stack/edit/:id/:name',
            },
          ],
        },
      ],
    },
    // {
    //   path: '/database',
    //   name: t('Database'),
    //   key: 'database',
    //   endpoints: 'trove',
    //   icon: <DatabaseFilled />,
    //   children: [
    //     {
    //       path: '/database/instances',
    //       name: t('Database Instances'),
    //       key: 'databaseInstances',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/database\/instances\/detail\/.[^/]+$/,
    //           name: t('Database Instance Detail'),
    //           key: 'databaseInstanceDetail',
    //           level: 2,
    //           routePath: '/database/instances/detail/:id',
    //         },
    //         {
    //           path: '/database/instances/create',
    //           name: t('Create Database Instance'),
    //           key: 'databaseInstanceCreate',
    //           level: 2,
    //         },
    //       ],
    //     },
    //     {
    //       path: '/database/backups',
    //       name: t('Backups'),
    //       key: 'databaseBackups',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/database\/backup\/detail\/.[^/]+$/,
    //           name: t('Backup Detail'),
    //           key: 'databaseBackupDetail',
    //           level: 2,
    //           routePath: '/database/backups/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/database/configurations',
    //       name: t('Configuration Groups'),
    //       key: 'configurations',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/database\/configuration\/detail\/.[^/]+$/,
    //           name: t('Configuration Detail'),
    //           key: 'configurationsDetail',
    //           level: 2,
    //           routePath: '/database/configurations/detail/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   path: '/container',
    //   name: t('Container'),
    //   key: 'container',
    //   icon: <ContainerOutlined />,
    //   children: [
    //     {
    //       path: '/container-service/containers',
    //       name: t('Containers'),
    //       key: 'zunContainers',
    //       endpoints: 'zun',
    //       level: 1,
    //       children: [
    //         {
    //           path: '/container-service/containers/create',
    //           name: t('Create Container'),
    //           key: 'zunContainersCreateContainer',
    //           level: 2,
    //         },
    //         {
    //           path: /^\/container-service\/containers\/detail\/.[^/]+$/,
    //           name: t('Container Detail'),
    //           key: 'zunContainerDetail',
    //           level: 2,
    //           routePath: '/container-service/containers/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-service/capsules',
    //       name: t('Capsules'),
    //       key: 'zunCapsules',
    //       endpoints: 'zun',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-service\/capsules\/detail\/.[^/]+$/,
    //           name: t('Capsule Detail'),
    //           key: 'zunCapsuleDetail',
    //           level: 2,
    //           routePath: '/container-service/capsules/detail/:id',
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-infra/clusters',
    //       name: t('Clusters'),
    //       key: 'containerInfraClusters',
    //       endpoints: 'magnum',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-infra\/clusters\/detail\/.[^/]+$/,
    //           name: t('Cluster Detail'),
    //           key: 'containerInfraClusterDetail',
    //           level: 2,
    //           routePath: '/container-infra/clusters/detail/:id',
    //         },
    //         {
    //           path: '/container-infra/clusters/create',
    //           name: t('Create Cluster'),
    //           key: 'containerInfraCreateCluster',
    //           level: 2,
    //         },
    //       ],
    //     },
    //     {
    //       path: '/container-infra/cluster-template',
    //       name: t('Cluster Templates'),
    //       key: 'clusterTemplate',
    //       endpoints: 'magnum',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/container-infra\/cluster-template\/detail\/.[^/]+$/,
    //           name: t('Cluster Template Detail'),
    //           key: 'containerInfraClusterTemplateDetail',
    //           level: 2,
    //           routePath: '/container-infra/cluster-template/detail/:id',
    //         },
    //         {
    //           path: '/container-infra/cluster-template/create',
    //           name: t('Create Cluster Template'),
    //           key: 'containerInfraCreateClusterTemplate',
    //           level: 2,
    //         },
    //         {
    //           path: /^\/container-infra\/cluster-template\/update\/.[^/]+$/,
    //           name: t('Update Cluster Template'),
    //           key: 'containerInfraUpdateClusterTemplate',
    //           level: 2,
    //           routePath: '/container-infra/cluster-template/update/:id',
    //         },
    //       ],
    //     },
    //   ],
    // },
  ];
  return menu;
};

export default renderMenu;
