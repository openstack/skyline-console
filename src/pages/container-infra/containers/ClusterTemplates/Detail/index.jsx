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
import globalClusterTemplateStore from 'src/stores/magnum/clusterTemplates';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class ClusterTemplateDetail extends Base {
  init() {
    this.store = globalClusterTemplateStore;
  }

  get name() {
    return t('Cluster Template Detail');
  }

  get listUrl() {
    return this.getRoutePath('clusterTemplate');
  }

  get policy() {
    return 'clustertemplate:detail';
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    return actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
        hidden: !this.isAdminPage,
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'general_info',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(ClusterTemplateDetail));
