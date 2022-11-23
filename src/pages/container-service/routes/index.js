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
import Containers from '../containers/Containers';
import Capsules from '../containers/Capsules';
import Hosts from '../containers/Hosts';
import ContainersDetail from '../containers/Containers/Detail';
import CapsulesDetail from '../containers/Capsules/Detail';
import HostsDetail from '../containers/Hosts/Detail';
import StepCreateContainer from '../containers/Containers/actions/StepCreate';
import Services from '../containers/Services';

const PATH = '/container-service';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      // Containers
      { path: `${PATH}/containers`, component: Containers, exact: true },
      {
        path: `${PATH}/containers/create`,
        component: StepCreateContainer,
        exact: true,
      },
      {
        path: `${PATH}/containers/detail/:id`,
        component: ContainersDetail,
        exact: true,
      },
      { path: `${PATH}/containers-admin`, component: Containers, exact: true },
      {
        path: `${PATH}/containers-admin/detail/:id`,
        component: ContainersDetail,
        exact: true,
      },
      {
        path: `${PATH}/capsules`,
        component: Capsules,
        exact: true,
      },
      {
        path: `${PATH}/capsules/detail/:id`,
        component: CapsulesDetail,
        exact: true,
      },
      {
        path: `${PATH}/hosts-admin`,
        component: Hosts,
        exact: true,
      },
      {
        path: `${PATH}/hosts-admin/detail/:id`,
        component: HostsDetail,
        exact: true,
      },
      {
        path: `${PATH}/services-admin`,
        component: Services,
        exact: true,
      },
      // All
      { path: '*', component: E404 },
    ],
  },
];
