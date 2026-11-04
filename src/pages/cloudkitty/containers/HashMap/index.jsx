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
import Base from 'containers/List';
import { CloudKittyHashMapServiceStore } from 'stores/cloudkitty/hashmapService';
import { cloudkittyEndpoint } from 'client/client/constants';
import { actionConfigs } from './actions';

export class HashMap extends Base {
  init() {
    this.store = new CloudKittyHashMapServiceStore();
    this.downloadStore = new CloudKittyHashMapServiceStore();
  }

  // CloudKitty's rating/hashmap endpoints take no `all_projects` argument and
  // reject it with a 400 ("Unknown argument: all_projects"). HashMap config is
  // global rather than project-scoped, so suppress the admin-page default that
  // appends all_projects=true to the list request.
  get fetchDataByAllProjects() {
    return false;
  }

  get policy() {
    return 'rating:module_config';
  }

  get name() {
    return t('hashmap services');
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return cloudkittyEndpoint();
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('cloudkittyHashmapServiceDetail'),
    },
    {
      title: t('Service ID'),
      dataIndex: 'service_id',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(HashMap));
