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

import React from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalNotificationStore, {
  NotificationStore,
} from 'stores/masakari/notifications';
import { Link } from 'react-router-dom';
import { masakariEndpoint } from 'client/client/constants';

export class Notifications extends Base {
  init() {
    this.store = globalNotificationStore;
    this.downloadStore = new NotificationStore();
  }

  get policy() {
    if (this.isAdminPage) {
      return 'os_compute_api:servers:index:get_all_tenants';
    }
    return 'os_compute_api:servers:index';
  }

  get name() {
    return t('segments');
  }

  get defaultSortKey() {
    return 'updated_at';
  }

  get endpoint() {
    return masakariEndpoint();
  }

  get checkEndpoint() {
    return true;
  }

  get searchFilters() {
    return [
      {
        label: t('Host'),
        name: 'source_host_uuid',
      },
      {
        label: t('UUID'),
        name: 'notification_uuid',
      },
    ];
  }

  getColumns = () => [
    {
      title: t('UUID'),
      dataIndex: 'notification_uuid',
      render: (value) => {
        const path = this.getRoutePath('masakariNotificationDetail', {
          id: value,
        });
        return <Link to={path}>{value}</Link>;
      },
      isHideable: true,
    },
    {
      title: t('Host'),
      dataIndex: 'source_host_uuid',
      isHideable: true,
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
    },
    {
      title: t('Payload'),
      dataIndex: 'payload',
      isHideable: true,
      render: (value) =>
        Object.keys(value).map((it) => (
          <div key={it}>
            {it}: {value[it]}
          </div>
        )),
    },
  ];
}

export default inject('rootStore')(observer(Notifications));
