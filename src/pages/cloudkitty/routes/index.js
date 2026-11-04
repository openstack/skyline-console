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
import Summary from '../containers/Summary';
import Reporting from '../containers/Reporting';
import Modules from '../containers/Modules';
import HashMap from '../containers/HashMap';
import HashMapDetail from '../containers/HashMap/Detail';
import PyScripts from '../containers/PyScripts';

const PATH = '/cloudkitty';
const ADMIN_PATH = '/cloudkitty-admin';

export default [
  {
    path: ADMIN_PATH,
    component: BaseLayout,
    routes: [
      { path: `${ADMIN_PATH}/summary`, component: Summary, exact: true },
      { path: `${ADMIN_PATH}/reporting`, component: Reporting, exact: true },
      { path: `${ADMIN_PATH}/modules`, component: Modules, exact: true },
      { path: `${ADMIN_PATH}/hashmap`, component: HashMap, exact: true },
      {
        path: `${ADMIN_PATH}/hashmap/detail/:id`,
        component: HashMapDetail,
        exact: true,
      },
      { path: `${ADMIN_PATH}/pyscripts`, component: PyScripts, exact: true },
      { path: '*', component: E404 },
    ],
  },
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/summary`, component: Summary, exact: true },
      { path: `${PATH}/reporting`, component: Reporting, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
