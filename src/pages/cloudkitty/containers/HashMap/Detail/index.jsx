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
import { CloudKittyHashMapServiceStore } from 'stores/cloudkitty/hashmapService';
import Fields from './Fields';
import Mappings from './Mappings';
import Thresholds from './Thresholds';

export class HashMapDetail extends Base {
  get name() {
    return t('hashmap service');
  }

  get policy() {
    return 'rating:module_config';
  }

  get listUrl() {
    return this.getRoutePath('cloudkittyHashmap');
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Service ID'),
        dataIndex: 'service_id',
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Fields'),
        key: 'fields',
        component: Fields,
      },
      {
        title: t('Mappings'),
        key: 'mappings',
        component: Mappings,
      },
      {
        title: t('Thresholds'),
        key: 'thresholds',
        component: Thresholds,
      },
    ];
  }

  init() {
    this.store = new CloudKittyHashMapServiceStore();
  }
}

export default inject('rootStore')(observer(HashMapDetail));
