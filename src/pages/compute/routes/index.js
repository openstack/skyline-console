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
import Instance from '../containers/Instance';
import InstanceDetail from '../containers/Instance/Detail';
import Flavor from '../containers/Flavor';
import FlavorDetail from '../containers/Flavor/Detail';
import FlavorCreate from '../containers/Flavor/actions/StepCreate';
import StepCreate from '../containers/Instance/actions/StepCreate';
import CreateIronic from '../containers/Instance/actions/CreateIronic';
import TabImage from '../containers/Image';
import ImageAdmin from '../containers/Image/Image';
import ImageCreate from '../containers/Image/actions/Create';
import ImageEdit from '../containers/Image/actions/Edit';
import InstanceSnapshot from '../containers/InstanceSnapshot';
import Keypair from '../containers/Keypair';
import KeypairDetail from '../containers/Keypair/Detail';
import ServerGroup from '../containers/ServerGroup';
import ServerGroupDetail from '../containers/ServerGroup/Detail';
import ImageDetail from '../containers/Image/Detail';
import Hypervisors from '../containers/Hypervisors';
import HypervisorDetail from '../containers/Hypervisors/Hypervisor/Detail';
import HostAggregate from '../containers/HostAggregate';
import BareMetalNode from '../containers/BareMetalNode';
import BareMetalNodeDetail from '../containers/BareMetalNode/Detail';
import CreateNode from '../containers/BareMetalNode/actions/Create';

const PATH = '/compute';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/instance`, component: Instance, exact: true },
      { path: `${PATH}/instance-admin`, component: Instance, exact: true },
      {
        path: `${PATH}/instance/detail/:id`,
        component: InstanceDetail,
        exact: true,
      },
      {
        path: `${PATH}/instance-admin/detail/:id`,
        component: InstanceDetail,
        exact: true,
      },
      { path: `${PATH}/instance/create`, component: StepCreate, exact: true },
      {
        path: `${PATH}/ironic-instance/create`,
        component: CreateIronic,
        exact: true,
      },
      {
        path: `${PATH}/instance-snapshot`,
        component: InstanceSnapshot,
        exact: true,
      },
      {
        path: `${PATH}/instance-snapshot-admin`,
        component: InstanceSnapshot,
        exact: true,
      },
      {
        path: `${PATH}/instance-snapshot/detail/:id`,
        component: ImageDetail,
        exact: true,
      },
      {
        path: `${PATH}/instance-snapshot-admin/detail/:id`,
        component: ImageDetail,
        exact: true,
      },
      { path: `${PATH}/flavor`, component: Flavor, exact: true },
      { path: `${PATH}/flavor-admin`, component: Flavor, exact: true },
      {
        path: `${PATH}/flavor/detail/:id`,
        component: FlavorDetail,
        exact: true,
      },
      {
        path: `${PATH}/flavor-admin/detail/:id`,
        component: FlavorDetail,
        exact: true,
      },
      { path: `${PATH}/server-group`, component: ServerGroup, exact: true },
      {
        path: `${PATH}/server-group-admin`,
        component: ServerGroup,
        exact: true,
      },
      {
        path: `${PATH}/server-group/detail/:id`,
        component: ServerGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/server-group-admin/detail/:id`,
        component: ServerGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/flavor-admin/create`,
        component: FlavorCreate,
        exact: true,
      },
      { path: `${PATH}/image`, component: TabImage, exact: true },
      { path: `${PATH}/image-admin`, component: ImageAdmin, exact: true },
      {
        path: `${PATH}/image/create`,
        component: ImageCreate,
        exact: true,
      },
      {
        path: `${PATH}/image-admin/create`,
        component: ImageCreate,
        exact: true,
      },
      {
        path: `${PATH}/image/edit/:id`,
        component: ImageEdit,
        exact: true,
      },
      {
        path: `${PATH}/image-admin/edit/:id`,
        component: ImageEdit,
        exact: true,
      },
      {
        path: `${PATH}/image/detail/:id`,
        component: ImageDetail,
        exact: true,
      },
      {
        path: `${PATH}/image-admin/detail/:id`,
        component: ImageDetail,
        exact: true,
      },
      { path: `${PATH}/keypair`, component: Keypair, exact: true },
      {
        path: `${PATH}/keypair/detail/:id`,
        component: KeypairDetail,
        exact: true,
      },
      {
        path: `${PATH}/hypervisors-admin`,
        component: Hypervisors,
        exact: true,
      },
      {
        path: `${PATH}/hypervisors-admin/detail/:id`,
        component: HypervisorDetail,
        exact: true,
      },
      {
        path: `${PATH}/aggregates-admin`,
        component: HostAggregate,
        exact: true,
      },
      {
        path: `${PATH}/baremetal-node-admin`,
        component: BareMetalNode,
        exact: true,
      },
      {
        path: `${PATH}/baremetal-node-admin/detail/:id`,
        component: BareMetalNodeDetail,
        exact: true,
      },
      {
        path: `${PATH}/baremetal-node-admin/create`,
        component: CreateNode,
        exact: true,
      },
      {
        path: `${PATH}/baremetal-node-admin/edit/:id`,
        component: CreateNode,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
