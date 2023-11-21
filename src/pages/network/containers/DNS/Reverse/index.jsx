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
import globalReverseStore, { ReverseStore } from 'src/stores/designate/reverse';
import actionConfigs from './actions';

export class Reverse extends Base {
  init() {
    this.store = globalReverseStore;
    this.downloadStore = new ReverseStore();
  }

  get policy() {
    return 'get_images';
  }

  get name() {
    return t('Reverse Dns');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Address'),
      dataIndex: 'address',
      isLink: true,
      routeName: 'dnsReverseDetail',
      routeParamsFunc: (data) => {
        return {
          id: data.id,
        };
      },
    },
    {
      title: t('PTR Domain Name'),
      dataIndex: 'ptrdname',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
    },
  ];
}

export default inject('rootStore')(observer(Reverse));
