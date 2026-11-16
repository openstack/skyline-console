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
import { CloudKittyPyScriptStore } from 'stores/cloudkitty/pyscript';
import { cloudkittyEndpoint } from 'client/client/constants';
import { actionConfigs } from './actions';

export class PyScripts extends Base {
  init() {
    this.store = new CloudKittyPyScriptStore();
    this.downloadStore = new CloudKittyPyScriptStore();
  }

  // CloudKitty's rating endpoints take no `all_projects` argument and reject
  // it with a 400. PyScripts config is global, so suppress the admin-page
  // default that appends all_projects=true to the list request.
  get fetchDataByAllProjects() {
    return false;
  }

  get policy() {
    return 'rating:module_config';
  }

  get name() {
    return t('py scripts');
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
      title: t('ID'),
      dataIndex: 'id',
    },
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Checksum'),
      dataIndex: 'checksum',
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

export default inject('rootStore')(observer(PyScripts));
