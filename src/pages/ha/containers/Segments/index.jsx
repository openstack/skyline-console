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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalSegmentStore, { SegmentStore } from 'stores/masakari/segments';
import { masakariEndpoint } from 'client/client/constants';
import actionConfigs from './actions';

export class Segments extends Base {
  init() {
    this.store = globalSegmentStore;
    this.downloadStore = new SegmentStore();
  }

  get policy() {
    if (this.isAdminPage) {
      return 'os_compute_api:servers:index:get_all_tenants';
    }
    return 'os_compute_api:servers:index';
  }

  get endpoint() {
    return masakariEndpoint();
  }

  get checkEndpoint() {
    return true;
  }

  get name() {
    return t('segments');
  }

  get defaultSortKey() {
    return 'updated_at';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Recovery Method'),
        name: 'recovery_method',
      },
      {
        label: t('Service Type'),
        name: 'service_type',
      },
      ...(this.isAdminPage
        ? [
            {
              label: t('Project Name'),
              name: 'project_name',
            },
          ]
        : []),
    ];
  }

  get rowKey() {
    return 'uuid';
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('masakariSegmentDetail'),
    },
    {
      title: t('UUID'),
      dataIndex: 'uuid',
      isHideable: true,
    },
    {
      title: t('Recovery Method'),
      dataIndex: 'recovery_method',
      isHideable: true,
    },
    {
      title: t('Service Type'),
      dataIndex: 'service_type',
      isHideable: true,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
  ];
}

export default inject('rootStore')(observer(Segments));
