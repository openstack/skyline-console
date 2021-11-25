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
import Snapshot from '../containers/Snapshot';
import SnapshotDetail from '../containers/Snapshot/Detail';
import Volume from '../containers/Volume';
import CreateVolume from '../containers/Volume/actions/Create';
import VolumeDetail from '../containers/Volume/Detail';
import Backups from '../containers/Backup';
import BackupDetail from '../containers/Backup/Detail';
import VolumeType from '../containers/VolumeType';
import VolumeTypeDetail from '../containers/VolumeType/VolumeType/Detail';
import QosDetail from '../containers/VolumeType/QosSpec/Detail';
import Storage from '../containers/Storage';
import Container from '../containers/Container';
import ContainerObject from '../containers/Container/Detail';

const PATH = '/storage';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/volume`, component: Volume, exact: true },
      { path: `${PATH}/volume-admin`, component: Volume, exact: true },
      { path: `${PATH}/volume/create`, component: CreateVolume, exact: true },
      {
        path: `${PATH}/volume/detail/:id`,
        component: VolumeDetail,
        exact: true,
      },
      {
        path: `${PATH}/volume-admin/detail/:id`,
        component: VolumeDetail,
        exact: true,
      },
      { path: `${PATH}/snapshot`, component: Snapshot, exact: true },
      { path: `${PATH}/snapshot-admin`, component: Snapshot, exact: true },
      {
        path: `${PATH}/snapshot/detail/:id`,
        component: SnapshotDetail,
        exact: true,
      },
      {
        path: `${PATH}/snapshot-admin/detail/:id`,
        component: SnapshotDetail,
        exact: true,
      },
      { path: `${PATH}/backup`, component: Backups, exact: true },
      { path: `${PATH}/backup-admin`, component: Backups, exact: true },
      {
        path: `${PATH}/backup/detail/:id`,
        component: BackupDetail,
        exact: true,
      },
      {
        path: `${PATH}/backup-admin/detail/:id`,
        component: BackupDetail,
        exact: true,
      },
      { path: `${PATH}/volume-type-admin`, component: VolumeType, exact: true },
      {
        path: `${PATH}/volume-type-admin/detail/:id`,
        component: VolumeTypeDetail,
        exact: true,
      },
      {
        path: `${PATH}/volume-type-admin/qos/detail/:id`,
        component: QosDetail,
        exact: true,
      },
      { path: `${PATH}/storage-admin`, component: Storage, exact: true },
      { path: `${PATH}/container`, component: Container, exact: true },
      {
        path: `${PATH}/container/detail/:container`,
        component: ContainerObject,
        exact: true,
      },
      {
        path: `${PATH}/container/detail/:container/:folder`,
        component: ContainerObject,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
