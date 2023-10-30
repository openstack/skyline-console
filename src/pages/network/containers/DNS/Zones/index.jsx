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
import globalDNSZonesStore, { DNSZonesStore } from 'src/stores/designate/zones';
import { ZONE_STATUS, ZONE_TYPES } from 'resources/dns/zone';
import { getOptions } from 'utils';
import actionConfigs from './actions';

export class Zones extends Base {
  init() {
    this.store = globalDNSZonesStore;
    this.downloadStore = new DNSZonesStore();
  }

  get policy() {
    return 'get_zones';
  }

  get name() {
    return t('dns zones');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  getColumns = () => [
    {
      title: t('Zone ID/Name'),
      dataIndex: 'name',
      isHideable: true,
      isLink: true,
      routeName: this.getRouteName('dnsZonesDetail'),
      sortKey: 'id',
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
      sortKey: 'tenant_id',
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      isHideable: true,
      sorter: false,
      valueMap: ZONE_TYPES,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
      valueMap: ZONE_STATUS,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Type'),
        name: 'type',
        options: getOptions(ZONE_TYPES),
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(ZONE_STATUS),
      },
    ];
  }
}

export default inject('rootStore')(observer(Zones));
