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
import globalClusterTemplateStore from 'src/stores/magnum/clusterTemplates';
import { getBaseTemplateColumns } from 'resources/magnum/template';
import actionConfigs from './actions';

export class ClusterTemplates extends Base {
  init() {
    this.store = globalClusterTemplateStore;
    this.downloadStore = globalClusterTemplateStore;
  }

  get name() {
    return t('clustertemplates');
  }

  get policy() {
    return 'clustertemplate:get_all';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => getBaseTemplateColumns(this);
}

export default inject('rootStore')(observer(ClusterTemplates));
