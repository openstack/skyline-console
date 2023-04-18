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
import actionConfigs from './actions';

export class Zones extends Base {
  init() {
    this.store = globalDNSZonesStore;
    this.downloadStore = new DNSZonesStore();
  }

  get policy() {
    return 'get_images';
  }

  get name() {
    return t('dns zones');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
      isHideable: true,
      isLink: true,
      routeName: 'dnsZonesDetail'
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      isHideable: true,
      sorter: false
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
      sorter: false,
    },
  ]

}

export default inject('rootStore')(observer(Zones));