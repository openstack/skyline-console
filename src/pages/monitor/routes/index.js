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
import PhysicalNode from '../containers/PhysicalNode';
import StorageCluster from '../containers/StorageCluster';
import OpenstackService from '../containers/OpenstackService';
import OtherService from '../containers/OtherService';
import Overview from '../containers/Overview';

const PATH = '/monitor-center';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/overview-admin`, component: Overview, exact: true },
      {
        path: `${PATH}/physical-node-admin`,
        component: PhysicalNode,
        exact: true,
      },
      {
        path: `${PATH}/storage-cluster-admin`,
        component: StorageCluster,
        exact: true,
      },
      {
        path: `${PATH}/openstack-service-admin`,
        component: OpenstackService,
        exact: true,
      },
      {
        path: `${PATH}/other-service-admin`,
        component: OtherService,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
