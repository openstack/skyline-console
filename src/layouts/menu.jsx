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
  GlobalOutlined,
  // ToolOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const renderMenu = (t) => {
  if (!t) {
    return [];
  }
  const menu = [
    {
      path: '/base/overview',
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
          path: '/compute/instance',
          name: t('Instance'),
          key: '/compute/instance',
          level: 1,
          children: [
            {
              path: /^\/compute\/instance\/detail\/.[^/]+$/,
              name: t('Instance Detail'),
              key: 'instance-detail',
              level: 2,
            },
            {
              path: '/compute/instance/create',
              name: t('Create Instance'),
              key: 'instance-create',
              level: 2,
            },
            {
              path: '/compute/ironic-instance/create',
              name: t('Create Ironic Instance'),
              key: 'ironic-instance-create',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/flavor',
          name: t('Flavor'),
          key: '/compute/flavor',
          level: 1,
          children: [
            {
              path: /^\/compute\/flavor\/detail\/.[^/]+$/,
              name: t('Flavor Detail'),
              key: 'flavor-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/server-group',
          name: t('Server Group'),
          key: '/compute/server-group',
          level: 1,
          children: [
            {
              path: /^\/compute\/server-group\/detail\/.[^/]+$/,
              name: t('Server Group Detail'),
              key: 'server-group-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/image',
          name: t('Image'),
          key: '/compute/image',
          level: 1,
          children: [
            {
              path: /^\/compute\/image\/detail\/.[^/]+$/,
              name: t('Image Detail'),
              key: 'image-detail',
              level: 2,
            },
            {
              path: '/compute/image/create',
              name: t('Create Image'),
              key: 'image-create',
              level: 2,
            },
          ],
        },
        {
          path: '/compute/keypair',
          name: t('Key Pairs'),
          key: '/compute/keypair',
          level: 1,
          children: [
            {
              path: /^\/compute\/keypair\/detail\/.[^/]*$/,
              name: t('Keypair Detail'),
              key: 'keypair-detail',
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
          path: '/storage/volume',
          name: t('Volume'),
          key: '/storage/volume',
          level: 1,
          children: [
            {
              path: '/storage/volume/create',
              name: t('Create Volume'),
              key: 'volume-create',
              level: 2,
            },
            {
              path: /^\/storage\/volume\/detail\/.[^/]+$/,
              name: t('Volume Detail'),
              key: 'volume-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/backup',
          name: t('Backups'),
          key: '/storage/backup',
          level: 1,
          children: [
            {
              path: /^\/storage\/backup\/detail\/.[^/]+$/,
              name: t('Backup Detail'),
              key: 'backup-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/storage/snapshot',
          name: t('Volume Snapshot'),
          key: '/storage/snapshot',
          level: 1,
          children: [
            {
              path: /^\/storage\/snapshot\/detail\/.[^/]+$/,
              name: t('Snapshot Detail'),
              key: 'snapshot-detail',
              level: 2,
            },
          ],
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
          path: '/network/networks',
          name: t('Networks'),
          key: '/network/networks',
          level: 1,
          children: [
            {
              path: /^\/network\/networks\/detail\/.[^/]+$/,
              name: t('Network Detail'),
              key: 'network_detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/virtual_adapter',
          name: t('Virtual Adapter'),
          key: '/network/virtual_adapter',
          level: 1,
          children: [
            {
              path: /^\/network\/virtual_adapter\/detail\/.[^/]+$/,
              name: t('Virtual Adapter Detail'),
              key: 'virtual_adapter-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/qos-policy',
          name: t('QoS Policy'),
          key: '/network/qos-policy',
          level: 1,
          children: [
            {
              path: /^\/network\/qos-policy\/detail\/.[^/]+$/,
              name: t('QoS Policy Detail'),
              key: 'qos-policy-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/router',
          name: t('Routers'),
          key: '/network/router',
          level: 1,
          children: [
            {
              path: /^\/network\/router\/detail\/.[^/]+$/,
              name: t('Router Detail'),
              key: 'router-detail',
              level: 2,
            },
            {
              path: /^\/network\/router\/.[^/]+\/port\/.[^/]+$/,
              name: t('Port Detail'),
              key: 'port-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/floatingip',
          name: t('Floating IPs'),
          key: '/network/floatingip',
          level: 1,
          children: [
            {
              path: /^\/network\/floatingip\/detail\/.[^/]+$/,
              name: t('Floating Ip Detail'),
              key: 'floatingip-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/topo',
          name: t('Topology'),
          key: '/network/topo',
          level: 1,
          children: [],
        },
        {
          path: '/network/load-balancers',
          name: t('Load Balancers'),
          key: '/network/load-balancers',
          level: 1,
          children: [
            {
              path: '/network/load-balancers/create',
              name: t('Create Loadbalancer'),
              key: 'load-balancer-create',
              level: 2,
            },
            {
              path: /^\/network\/load-balancers\/detail\/.[^/]+$/,
              name: t('Load Balancer Detail'),
              key: 'load-balancer-detail',
              level: 2,
            },
            {
              path: /^\/network\/load-balancers\/.[^/]+\/listener\/.[^/]+$/,
              name: t('Listener Detail'),
              key: 'listener-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/vpn',
          name: t('VPN'),
          key: '/network/vpn',
          level: 1,
          children: [
            {
              path: /^\/network\/vpn-tunnel\/detail\/.[^/]+$/,
              name: t('VPN Tunnel Detail'),
              key: 'vpn-tunnel-detail',
              level: 2,
            },
          ],
        },
        {
          path: '/network/security-group',
          name: t('Security Groups'),
          key: '/network/security-group',
          level: 1,
          children: [
            {
              path: /^\/network\/security-group\/detail\/.[^/]+$/,
              name: t('Security Group Detail'),
              key: 'security-group-detail',
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
    //       path: '/management/recycle-bin',
    //       name: t('Recycle Bin'),
    //       key: '/management/recycle-bin',
    //       level: 1,
    //       children: [
    //         {
    //           path: /^\/management\/recycle-bin\/detail\/.[^/]+$/,
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
          path: '/heat/stack',
          name: t('Stacks'),
          key: '/heat/stack',
          level: 1,
          children: [
            {
              path: /^\/heat\/stack\/detail\/.[^/]+\/.[^/]+$/,
              name: t('Stack Detail'),
              key: 'stack-detail',
              level: 2,
            },
            {
              path: '/heat/stack/create',
              name: t('Create Stack'),
              key: 'stack-create',
              level: 2,
            },
            {
              path: /^\/heat\/stack\/edit\/.[^/]+\/.[^/]+$/,
              name: t('Update Template'),
              key: 'stack-edit',
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
