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

import React from 'react';
import {
  DesktopOutlined,
  DatabaseOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  // ToolOutlined,
  SettingOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const renderMenu = (t) => {
  if (!t) {
    return [];
  }
  const menu = [
    {
      path: '/base/overview-admin',
      name: t('Home'),
      key: '/home',
      icon: <HomeOutlined />,
      level: 0,
      hasBreadcrumb: false,
      hasChildren: false,
    },
    {
      path: '/compute',
      name: t('Compute'),
      key: '/compute',
      icon: <DesktopOutlined />,
      children: [
        {
          path: '/compute/instance-admin',
          name: t('Instance'),
          key: '/compute/instance-admin',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance-admin\/detail\/.[^/]+$/,
              name: t('Instance Detail'),
              key: 'instance-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/flavor-admin',
          name: t('Flavor'),
          key: '/compute/flavor',
          level: 1,
          children: [
            {
              path: '/compute/flavor-admin/create',
              name: t('Create Flavor'),
              key: 'flavor-create',
              level: 2,
            },
            {
              path: /^\/compute\/flavor-admin\/detail\/[^/]+$/,
              name: t('Flavor Detail'),
              key: 'flavor-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/server-group-admin',
          name: t('Server Group'),
          key: '/compute/server-group-admin',
          level: 1,
          children: [
            {
              path: /^\/compute\/server-group-admin\/detail\/.[^/]+$/,
              name: t('Server Group Detail'),
              key: 'server-group-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/image-admin',
          name: t('Image'),
          key: '/compute/image-admin',
          level: 1,
          children: [
            {
              path: /^\/compute\/image-admin\/detail\/.[^/]+$/,
              name: t('Image Detail'),
              key: 'image-detail',
              level: 2,
            },
            {
              path: '/compute/image-admin/create',
              name: t('Create Image'),
              key: 'image-create',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/hypervisors-admin',
          name: t('Hypervisors'),
          key: '/compute/hypervisors',
          level: 1,
          children: [
            {
              path: /^\/compute\/hypervisors-admin\/detail\/.[^/]+$/,
              name: t('Hypervisor Detail'),
              key: 'hypervisor-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/aggregates-admin',
          name: t('Host Aggregates'),
          key: '/compute/aggregates',
          level: 1,
          children: [],
        },
        {
          path: '/compute/baremetal-node-admin',
          name: t('Bare Metal Setting'),
          key: '/compute/baremetal-node',
          level: 1,
          children: [
            {
              path: /^\/compute\/baremetal-node-admin\/detail\/.[^/]+$/,
              name: t('Bare Metal Node Detail'),
              key: 'baremetal-node-detail',
              level: 2,
            },
            {
              path: /^\/compute\/baremetal-node-admin\/create$/,
              name: t('Create Bare Metal Node'),
              key: 'baremetal-node-create',
              level: 2,
            },
            {
              path: /^\/compute\/baremetal-node-admin\/edit\/.[^/]+$/,
              name: t('Bare Metal Node Edit'),
              key: 'baremetal-node-edit',
              level: 2,
            },
          ],
        },
      ],
    },
    {
      path: '/storage',
      name: t('Storage'),
      key: '/storage',
      icon: <DatabaseOutlined />,
      children: [
        {
          path: '/storage/volume-admin',
          name: t('Volume'),
          key: '/storage/volume',
          level: 1,
          children: [
            {
              path: /^\/storage\/volume-admin\/detail\/.[^/]+$/,
              name: t('Volume Detail'),
              key: 'volume-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/backup-admin',
          name: t('Backups'),
          key: '/storage/backup',
          level: 1,
          children: [
            {
              path: /^\/storage\/backup-admin\/detail\/.[^/]+$/,
              name: t('Backup Detail'),
              key: 'backup-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/snapshot-admin',
          name: t('Volume Snapshot'),
          key: '/storage/snapshot',
          level: 1,
          children: [
            {
              path: /^\/storage\/snapshot-admin\/detail\/.[^/]+$/,
              name: t('Snapshot Detail'),
              key: 'snapshot-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/volume-type-admin',
          name: t('Volume Type'),
          key: '/storage/volume-type',
          level: 1,
          children: [
            {
              path: /^\/storage\/volume-type-admin\/detail\/.[^/]+$/,
              name: t('Volume Type Detail'),
              key: 'volume-type-detail',
              level: 2,
            },
            {
              path: /^\/storage\/volume-type-admin\/qos\/detail\/.[^/]+$/,
              name: t('QoS Detail'),
              key: 'volume-type-qos-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/storage-admin',
          name: t('Storage Backend'),
          key: '/storage/storage',
          level: 1,
          children: [],
        },
      ],
    },
    {
      path: '/network',
      name: t('Network'),
      key: '/network',
      icon: <GlobalOutlined />,
      children: [
        {
          path: '/network/networks-admin',
          name: t('Networks'),
          key: '/network/networks',
          level: 1,
          children: [
            {
              path: /^\/network\/networks-admin\/detail\/.[^/]+$/,
              name: t('Network Detail'),
              key: 'network_detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/virtual_adapter_admin',
          name: t('Virtual Adapter'),
          key: '/network/virtual_adapter_admin',
          level: 1,
          children: [
            {
              path: /^\/network\/virtual_adapter_admin\/detail\/.[^/]+$/,
              name: t('Virtual Adapter Detail'),
              key: 'virtual_adapter-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/qos-policy-admin',
          name: t('QoS Policy'),
          key: '/network/qos-policy-admin',
          level: 1,
          children: [
            {
              path: /^\/network\/qos-policy-admin\/detail\/.[^/]+$/,
              name: t('QoS Policy Detail'),
              key: 'qos-policy-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/router-admin',
          name: t('Routers'),
          key: '/network/router-admin',
          level: 1,
          children: [
            {
              path: /^\/network\/router-admin\/detail\/.[^/]+$/,
              name: t('Router Detail'),
              key: 'router-detail',
              level: 2,
            },
            {
              path: /^\/network\/router-admin\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'port-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/floatingip-admin',
          name: t('Floating IPs'),
          key: '/network/floatingip-admin',
          level: 1,
          children: [
            {
              path: /^\/network\/floatingip-admin\/detail\/.[^/]+$/,
              name: t('Floating Ip Detail'),
              key: 'floatingip-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/load-balancers-admin',
          name: t('Load Balancers'),
          key: '/network/load-balancers-admin',
          level: 1,
          children: [
            {
              path: /^\/network\/load-balancers-admin\/detail\/.[^/]+$/,
              name: t('Load Balancer Detail'),
              key: 'load-balancer-detail',
              level: 2,
            },
            {
              path: /^\/network\/load-balancers-admin\/.[^/]+\/listener\/.[^/]+$/,
              name: t('Listener Detail'),
              key: 'listener-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/vpn-admin',
          name: t('VPN'),
          key: '/network/vpn-admin',
          level: 1,
          children: [
            {
              path: /^\/network\/ipsec-site-connection-admin\/detail\/.[^/]+$/,
              name: t('IPsec site connection Detail'),
              key: 'ipsec-site-connection-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/security-group-admin',
          name: t('Security Groups'),
          key: '/network/security-group',
          level: 1,
          children: [
            {
              path: /^\/network\/security-group-admin\/detail\/.[^/]+$/,
              name: t('Security Group Detail'),
              key: 'security-group-detail',
              level: 2,
            },
          ],
        },
      ],
    },
    {
      path: '/identity',
      name: t('Identity'),
      key: '/identity',
      icon: <CreditCardOutlined />,
      children: [
        {
          path: '/identity/domain-admin',
          name: t('Domains'),
          key: '/identity/domain',
          level: 1,
          children: [
            {
              path: '/identity/domain-admin/create',
              name: t('Create Domain'),
              key: 'domain-create',
              level: 2,
            },
            {
              path: /^\/identity\/domain-admin\/edit\/.[^/]+$/,
              name: t('Domain Edit'),
              key: 'domain-edit',
              level: 2,
            },
            {
              path: /^\/identity\/domain-admin\/detail\/.[^/]+$/,
              name: t('Domain Detail'),
              key: 'domain-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/identity/project-admin',
          name: t('Projects'),
          key: '/identity/project',
          level: 1,
          children: [
            {
              path: /^\/identity\/project-admin\/detail\/.[^/]+$/,
              name: t('Project Detail'),
              key: 'project-detail',
              level: 2,
            },
            {
              path: '/identity/project-admin/create',
              name: t('Create Project'),
              key: 'project-create',
              level: 2,
            },
            {
              path: /^\/identity\/project-admin\/edit\/.[^/]+$/,
              name: t('Edit Project'),
              key: 'project-edit',
              level: 2,
            },
          ],
        },
        {
          path: '/identity/user-admin',
          name: t('Users'),
          key: '/identity/user',
          level: 1,
          children: [
            {
              path: /^\/identity\/user-admin\/detail\/.[^/]+$/,
              name: t('User Detail'),
              key: 'user-detail',
              level: 2,
            },
            {
              path: '/identity/user-admin/create',
              name: t('Create User'),
              key: 'user-create',
              level: 2,
            },
            {
              path: /^\/identity\/user-admin\/edit\/.[^/]+$/,
              name: t('User Edit'),
              key: 'user-edit',
              level: 2,
            },
          ],
        },
        {
          path: '/identity/user-group-admin',
          name: t('User Groups'),
          key: '/identity/user-group',
          level: 1,
          children: [
            {
              path: /^\/identity\/user-group-admin\/detail\/.[^/]+$/,
              name: t('User Group Detail'),
              key: 'project-detail',
              level: 2,
            },
            {
              path: '/identity/user-group-admin/create',
              name: t('Create User Group'),
              key: 'user-group-create',
              level: 2,
            },
            {
              path: /^\/identity\/user-group-admin\/edit\/.[^/]+$/,
              name: t('Edit User Group'),
              key: 'user-group-edit',
              level: 2,
            },
          ],
        },
        {
          path: '/identity/role-admin',
          name: t('Roles'),
          key: '/identity/role-admin',
          level: 1,
          children: [
            {
              path: /^\/identity\/role-admin\/detail\/.[^/]+$/,
              name: t('Role Detail'),
              key: 'role-detail',
              level: 2,
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
    //       key: '/management/recycle-bin-admin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/management\/recycle-bin-admin\/detail\/.[^/]+$/,
    //           name: t('Instance Detail'),
    //           key: 'recycle-bin-detail',
    //           level: 2,
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      path: '/heat',
      name: t('Orchestration'),
      key: '/heat',
      icon: <AppstoreOutlined />,
      children: [
        {
          path: '/heat/stack-admin',
          name: t('Stacks'),
          key: '/heat/stack-admin',
          level: 1,
          children: [
            {
              path: /^\/heat\/stack-admin\/detail\/.[^/]+\/.[^/]+$/,
              name: t('Stack Detail'),
              key: 'stack-detail',
              level: 2,
            },
            {
              path: '/heat/stack-admin/create',
              name: t('Create Stack'),
              key: 'stack-create',
              level: 2,
            },
            {
              path: /^\/heat\/stack-admin\/edit\/.[^/]+\/.[^/]+$/,
              name: t('Update Template'),
              key: 'stack-edit',
              level: 2,
            },
          ],
        },
      ],
    },
    {
      path: '/configuration-admin',
      name: t('Global Setting'),
      key: '/configuration-admin',
      icon: <SettingOutlined />,
      children: [
        {
          path: '/configuration-admin/info',
          name: t('System Info'),
          key: '/configuration-admin/info',
          level: 1,
          children: [
            {
              path: /^\/configuration-admin\/neutron\/detail\/.[^/]+$/,
              name: t('Neutron Agent Detail'),
              key: 'neutron-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/configuration-admin/setting',
          name: t('System Config'),
          key: '/configuration-admin/setting',
          level: 1,
        },
        {
          path: '/configuration-admin/metadata',
          name: t('Metadata Definitions'),
          key: '/configuration-admin/metadata',
          level: 1,
          children: [
            {
              path: /^\/configuration-admin\/metadata\/detail\/.[^/]+$/,
              name: t('Metadata Detail'),
              key: 'metadata-detail',
              level: 2,
            },
          ],
        },
      ],
    },
  ];
  return menu;
};

export default renderMenu;
