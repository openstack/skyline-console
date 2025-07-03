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

import { inject, observer } from 'mobx-react';
import Base from 'containers/TabDetail';
import globalNotificationStore from 'stores/masakari/notifications';
import BaseDetail from './BaseDetail';
import ProgressDetails from './ProgressDetails';

export class NotificationsDetail extends Base {
  init() {
    this.store = globalNotificationStore;
  }

  get name() {
    return t('Host Detail');
  }

  get listUrl() {
    return this.getRoutePath('masakariNotifications');
  }

  get policy() {
    return 'capsule:get_one_all_projects';
  }

  get detailInfos() {
    return [
      {
        title: t('Type'),
        dataIndex: 'type',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'baseDetail',
        component: BaseDetail,
      },
      {
        title: t('Progress Details'),
        key: 'progressDetails',
        component: ProgressDetails,
      },
    ];
  }
}

export default inject('rootStore')(observer(NotificationsDetail));
