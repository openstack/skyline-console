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
import BaseDetail from './BaseDetail';
import RecordSets from './RecordSets';
import { DNSZonesStore } from 'src/stores/designate/zones';

export class ZonesDetail extends Base {
  init() {
    this.store = new DNSZonesStore();
  }

  get name() {
    return t('DNS Zones Detail');
  }

  get listUrl() {
    return this.getRoutePath('dnsZones');
  }

  get policy() {
    return 'get_images';
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Type'),
        dataIndex: 'type',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
      },
      {
        title: t('Email'),
        dataIndex: 'email',
      }
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Overview'),
        key: 'overview',
        component: BaseDetail,
      },
      {
        title: t('Record Sets'),
        key: 'record_sets',
        component: RecordSets,
      }
    ]

    return tabs;

  }

}

export default inject('rootStore')(observer(ZonesDetail));