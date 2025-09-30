// Copyright 2025 99cloud
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

import BaseLayout from 'layouts/Basic';
import E404 from 'pages/base/containers/404';
import SecretList from '../containers/Secret';
import SecretDetail from '../containers/Secret/Detail';

const PATH = '/key-manager';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/secret`, component: SecretList, exact: true },
      {
        path: `${PATH}/secret/detail/:id`,
        component: SecretDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
