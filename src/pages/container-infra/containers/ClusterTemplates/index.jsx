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

import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import { ClusterTemplatesStore } from 'stores/magnum/clusterTemplates';
import { ClusterTemplatesAdminStore } from 'stores/magnum/clusterTemplatesAdmin';
import { getBaseTemplateColumns } from 'resources/magnum/template';
import actionConfigs from './actions';

export class ClusterTemplates extends Base {
  init() {
    if (this.isAdminPage) {
      this.store = new ClusterTemplatesAdminStore();
    } else {
      this.store = new ClusterTemplatesStore();
    }
  }

  get name() {
    return t('clustertemplates');
  }

  get policy() {
    return 'clustertemplate:get_all';
  }

  get fetchDataByAllProjects() {
    return false;
  }

  updateFetchParams = (params) => {
    return {
      ...params,
      shouldFetchProject: this.isAdminPage,
    };
  };

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    return actionConfigs.actionConfigs;
  }

  getColumns() {
    return getBaseTemplateColumns(this);
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(ClusterTemplates));
