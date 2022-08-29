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
import ShareType from '../containers/ShareType';
import ShareTypeDetail from '../containers/ShareType/Detail';
import ShareGroupType from '../containers/ShareGroupType';
import ShareGroupTypeDetail from '../containers/ShareGroupType/Detail';
import ShareInstance from '../containers/ShareInstance';
import ShareInstanceDetail from '../containers/ShareInstance/Detail';
import ShareNetwork from '../containers/ShareNetwork';
import ShareNetworkDetail from '../containers/ShareNetwork/Detail';
import ShareGroup from '../containers/ShareGroup';
import ShareGroupDetail from '../containers/ShareGroup/Detail';
import Share from '../containers/Share';
import ShareDetail from '../containers/Share/Detail';
import ShareCreate from '../containers/Share/actions/Create';
import ShareServer from '../containers/ShareServer';
import ShareServerDetail from '../containers/ShareServer/Detail';
import Storage from '../containers/Storage';

const PATH = '/share';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/share-type-admin`, component: ShareType, exact: true },
      {
        path: `${PATH}/share-type-admin/detail/:id`,
        component: ShareTypeDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-group-type-admin`,
        component: ShareGroupType,
        exact: true,
      },
      {
        path: `${PATH}/share-group-type-admin/detail/:id`,
        component: ShareGroupTypeDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-instance-admin`,
        component: ShareInstance,
        exact: true,
      },
      {
        path: `${PATH}/share-instance-admin/detail/:id`,
        component: ShareInstanceDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-network`,
        component: ShareNetwork,
        exact: true,
      },
      {
        path: `${PATH}/share-network/detail/:id`,
        component: ShareNetworkDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-network-admin`,
        component: ShareNetwork,
        exact: true,
      },
      {
        path: `${PATH}/share-network-admin/detail/:id`,
        component: ShareNetworkDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-group`,
        component: ShareGroup,
        exact: true,
      },
      {
        path: `${PATH}/share-group/detail/:id`,
        component: ShareGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-group-admin`,
        component: ShareGroup,
        exact: true,
      },
      {
        path: `${PATH}/share-group-admin/detail/:id`,
        component: ShareGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/share`,
        component: Share,
        exact: true,
      },
      {
        path: `${PATH}/share/detail/:id`,
        component: ShareDetail,
        exact: true,
      },
      {
        path: `${PATH}/share/create`,
        component: ShareCreate,
        exact: true,
      },
      {
        path: `${PATH}/share-admin`,
        component: Share,
        exact: true,
      },
      {
        path: `${PATH}/share-admin/detail/:id`,
        component: ShareDetail,
        exact: true,
      },
      {
        path: `${PATH}/share-server-admin`,
        component: ShareServer,
        exact: true,
      },
      {
        path: `${PATH}/share-server-admin/detail/:id`,
        component: ShareServerDetail,
        exact: true,
      },
      { path: `${PATH}/storage-admin`, component: Storage, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
