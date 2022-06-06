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
import Domain from '../containers/Domain';
import DomainDetail from '../containers/Domain/Detail';
import Project from '../containers/Project';
import ProjectCreate from '../containers/Project/actions/Create';
import ProjectEdit from '../containers/Project/actions/Edit';
import ProjectDetail from '../containers/Project/Detail';
import User from '../containers/User';
import UserCreate from '../containers/User/actions/Create';
import UserEdit from '../containers/User/actions/Edit';
import UserDetail from '../containers/User/Detail';
import UserGroup from '../containers/UserGroup';
import UserGroupCreate from '../containers/UserGroup/actions/Create';
import UserGroupEdit from '../containers/UserGroup/actions/Edit';
import UserGroupDetail from '../containers/UserGroup/Detail';
import Role from '../containers/Role';
import RoleDetail from '../containers/Role/Detail';

const PATH = '/identity';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/domain-admin`, component: Domain, exact: true },
      {
        path: `${PATH}/domain-admin/detail/:id`,
        component: DomainDetail,
        exact: true,
      },
      { path: `${PATH}/project`, component: Project, exact: true },
      { path: `${PATH}/project-admin`, component: Project, exact: true },
      { path: `${PATH}/project/create`, component: ProjectCreate, exact: true },
      {
        path: `${PATH}/project-admin/create`,
        component: ProjectCreate,
        exact: true,
      },
      { path: `${PATH}/project/edit/:id`, component: ProjectEdit, exact: true },
      {
        path: `${PATH}/project-admin/edit/:id`,
        component: ProjectEdit,
        exact: true,
      },
      { path: `${PATH}/user`, component: User, exact: true },
      { path: `${PATH}/user-admin`, component: User, exact: true },
      { path: `${PATH}/user-admin/create`, component: UserCreate, exact: true },
      { path: `${PATH}/user-admin/edit/:id`, component: UserEdit, exact: true },
      {
        path: `${PATH}/user-admin/detail/:id`,
        component: UserDetail,
        exact: true,
      },
      { path: `${PATH}/user-group-admin`, component: UserGroup, exact: true },
      {
        path: `${PATH}/user-group-admin/detail/:id`,
        component: UserGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/user-group-admin/create`,
        component: UserGroupCreate,
        exact: true,
      },
      {
        path: `${PATH}/user-group-admin/edit/:id`,
        component: UserGroupEdit,
        exact: true,
      },
      { path: `${PATH}/role-admin`, component: Role, exact: true },
      {
        path: `${PATH}/role-admin/detail/:id`,
        component: RoleDetail,
        exact: true,
      },
      {
        path: `${PATH}/project/detail/:id`,
        component: ProjectDetail,
        exact: true,
      },
      {
        path: `${PATH}/project-admin/detail/:id`,
        component: ProjectDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
