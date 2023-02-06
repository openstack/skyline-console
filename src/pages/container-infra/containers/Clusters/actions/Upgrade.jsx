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
import { ModalAction } from 'containers/Action';
import { ClustersStore } from 'stores/magnum/clusters';
import { ClusterTemplatesStore } from 'stores/magnum/clusterTemplates';
import { getBaseTemplateColumns } from 'resources/magnum/template';

export class Upgrade extends ModalAction {
  static id = 'upgrade-cluster';

  static title = t('Upgrade Cluster');

  static policy = 'cluster:upgrade';

  static allowed = () => Promise.resolve(true);

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.store = new ClustersStore();
    this.templateStore = new ClusterTemplatesStore();
    this.getClustertemplates();
  }

  async getClustertemplates() {
    await this.templateStore.fetchList();
  }

  get clusterTemplates() {
    return this.templateStore.list.data || [];
  }

  get formItems() {
    return [
      {
        name: 'clusterTemplate',
        label: t('Cluster Template'),
        type: 'select-table',
        data: this.clusterTemplates,
        isLoading: this.templateStore.list.isLoading,
        required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getBaseTemplateColumns(this),
      },
    ];
  }

  onSubmit = (values) => {
    const { clusterTemplate } = values;
    const { selectedRowKeys = [] } = clusterTemplate;
    const data = {
      cluster_template: selectedRowKeys[0],
    };
    return this.store.upgrade({ id: this.item.id }, data);
  };
}

export default inject('rootStore')(observer(Upgrade));
