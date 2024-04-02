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
import Segments from '../containers/Segments';
import Hosts from '../containers/Hosts';
import Notifications from '../containers/Notifications';
import SegmentsDetail from '../containers/Segments/Detail';
import HostsDetail from '../containers/Hosts/Detail';
import NotificationsDetail from '../containers/Notifications/Detail';
import StepCreate from '../containers/Segments/actions/StepCreate';

const PATH = '/ha';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/segments-admin`, component: Segments, exact: true },
      {
        path: `${PATH}/segments-admin/create-step-admin`,
        component: StepCreate,
        exact: true,
      },
      {
        path: `${PATH}/segments-admin/detail/:id`,
        component: SegmentsDetail,
        exact: true,
      },
      { path: `${PATH}/hosts-admin`, component: Hosts, exact: true },
      {
        path: `${PATH}/hosts-admin/detail/:id`,
        component: HostsDetail,
        exact: true,
      },
      {
        path: `${PATH}/notifications-admin`,
        component: Notifications,
        exact: true,
      },
      {
        path: `${PATH}/notifications-admin/detail/:id`,
        component: NotificationsDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
