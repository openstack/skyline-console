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

import BlankLayout from 'layouts/Blank';
import E404 from 'pages/base/containers/404';
import { lazy } from 'react';

const Auth = lazy(() =>
  import(/* webpackChunkName: "auth" */ 'pages/auth/App')
);

const Basic = lazy(() =>
  import(/* webpackChunkName: "basic" */ 'pages/basic/App')
);

export default [
  {
    component: BlankLayout,
    routes: [
      {
        path: '/',
        redirect: { from: '/', to: '/base/overview', exact: true },
      },
      {
        path: '/login',
        redirect: { from: '/login', to: '/auth/login', exact: true },
      },
      {
        path: '/auth',
        component: Auth,
      },
      {
        path: '/',
        component: Basic,
      },
      {
        path: '*',
        component: E404,
      },
    ],
  },
];
