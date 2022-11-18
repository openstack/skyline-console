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
import Clusters from '../containers/Clusters';
import ClustersDetail from '../containers/Clusters/Detail';
import ClusterTemplates from '../containers/ClusterTemplates';
import ClusterTemplateDetail from '../containers/ClusterTemplates/Detail';
import ClustersCreate from '../containers/Clusters/actions/StepCreate';
import ClustersTemplateCreate from '../containers/ClusterTemplates/actions/StepCreate';
import ClusterTemplateUpdate from '../containers/ClusterTemplates/actions/Edit';

const PATH = '/container-infra';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/clusters`, component: Clusters, exact: true },
      {
        path: `${PATH}/clusters/detail/:id`,
        component: ClustersDetail,
        exact: true,
      },
      {
        path: `${PATH}/clusters/create`,
        component: ClustersCreate,
        exact: true,
      },
      { path: `${PATH}/clusters-admin`, component: Clusters, exact: true },
      {
        path: `${PATH}/clusters-admin/detail/:id`,
        component: ClustersDetail,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template`,
        component: ClusterTemplates,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template/detail/:id`,
        component: ClusterTemplateDetail,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template/create`,
        component: ClustersTemplateCreate,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template/update/:id`,
        component: ClusterTemplateUpdate,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template-admin`,
        component: ClusterTemplates,
        exact: true,
      },
      {
        path: `${PATH}/cluster-template-admin/detail/:id`,
        component: ClusterTemplateDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
