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

import BaseLayout from 'layouts/Basic';
import E404 from 'pages/base/containers/404';
import Instances from '../containers/Instances';
import StepCreate from '../containers/Instances/actions/StepCreate';
import Backups from '../containers/Backups';
import Configurations from '../containers/Configurations';
import InstancesDetail from '../containers/Instances/Detail';
import ConfigurationsDetail from '../containers/Configurations/Detail';
import BackupsDetail from '../containers/Backups/Detail';

const PATH = '/database';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/instances`, component: Instances, exact: true },
      { path: `${PATH}/instances-admin`, component: Instances, exact: true },
      { path: `${PATH}/instances/create`, component: StepCreate, exact: true },
      { path: `${PATH}/backups`, component: Backups, exact: true },
      {
        path: `${PATH}/configurations`,
        component: Configurations,
        exact: true,
      },
      {
        path: `${PATH}/instances/detail/:id`,
        component: InstancesDetail,
        exact: true,
      },
      {
        path: `${PATH}/instances-admin/detail/:id`,
        component: InstancesDetail,
        exact: true,
      },
      {
        path: `${PATH}/backups/detail/:id`,
        component: BackupsDetail,
        exact: true,
      },
      {
        path: `${PATH}/configurations/detail/:id`,
        component: ConfigurationsDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
