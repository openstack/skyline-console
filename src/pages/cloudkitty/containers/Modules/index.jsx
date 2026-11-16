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
import { CloudKittyModuleStore } from 'stores/cloudkitty/module';
import { cloudkittyEndpoint } from 'client/client/constants';
import { actionConfigs } from './actions';

export class Modules extends Base {
  init() {
    this.store = new CloudKittyModuleStore();
    this.downloadStore = new CloudKittyModuleStore();
  }

  // CloudKitty's rating endpoints take no `all_projects` argument and reject
  // it with a 400. Rating modules are global, so suppress the admin-page
  // default that appends all_projects=true to the list request.
  get fetchDataByAllProjects() {
    return false;
  }

  get policy() {
    return 'rating:list_modules';
  }

  get name() {
    return t('rating modules');
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

  get hideSearch() {
    return true;
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
      width: 150,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
    },
    {
      title: t('Configurable'),
      dataIndex: 'hotConfig',
      width: 150,
      valueRender: 'yesNo',
    },
    {
      title: t('Priority'),
      dataIndex: 'priority',
      width: 100,
      isHideable: true,
    },
    {
      title: t('Enabled'),
      dataIndex: 'enabled',
      width: 110,
      valueRender: 'yesNo',
    },
  ];
}

export default inject('rootStore')(observer(Modules));
