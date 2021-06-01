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

import BlankLayout from '@/layouts/Blank';
import E404 from 'pages/base/containers/404';
import { lazy } from 'react';

const Base = lazy(() =>
  import(/* webpackChunkName: "base" */ '@/pages/base/App')
);
const Compute = lazy(() =>
  import(/* webpackChunkName: "compute" */ '@/pages/compute/App')
);
const User = lazy(() =>
  import(/* webpackChunkName: "user" */ '@/pages/user/App')
);
const Storage = lazy(() =>
  import(/* webpackChunkName: "storage" */ '@/pages/storage/App')
);
const Network = lazy(() =>
  import(/* webpackChunkName: "network" */ '@/pages/network/App')
);
const Identity = lazy(() =>
  import(/* webpackChunkName: "identity" */ '@/pages/identity/App')
);
const Configs = lazy(() =>
  import(/* webpackChunkName: "configuration" */ '@/pages/configuration/App')
);
// const Management = lazy(() =>
//   import(/* webpackChunkName: "Management" */ '@/pages/management/App')
// );
const Heat = lazy(() =>
  import(/* webpackChunkName: "heat" */ '@/pages/heat/App')
);

export default [
  {
    component: BlankLayout,
    routes: [
      {
        path: '/',
        // redirect: { from: '/', to: '/base/403', exact: true }
        redirect: { from: '/', to: '/user/login', exact: true },
      },
      {
        path: '/login',
        redirect: { from: '/login', to: '/user/login', exact: true },
      },
      {
        path: '/user',
        component: User,
      },
      {
        path: '/compute',
        component: Compute,
      },
      {
        path: '/storage',
        component: Storage,
      },
      {
        path: '/network',
        component: Network,
      },
      {
        path: '/identity',
        component: Identity,
      },
      {
        path: '/configuration-admin',
        component: Configs,
      },
      // {
      //   path: '/management',
      //   component: Management,
      // },
      {
        path: '/heat',
        component: Heat,
      },
      {
        path: '/base',
        component: Base,
      },
      {
        path: '*',
        component: E404,
      },
    ],
  },
];
