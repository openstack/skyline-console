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
import { ModalAction } from 'src/containers/Action';
import globalClustersStore from 'stores/magnum/clusters';

export class Resize extends ModalAction {
  init() {
    this.store = globalClustersStore;
  }

  static id = 'resize-cluster';

  static title = t('Resize Cluster');

  policy = 'cluster:resize';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Resize Cluster');
  }

  static buttonText = t('Resize');

  get defaultValue() {
    const { node_count } = this.item;
    return {
      node_count: node_count || 1,
    };
  }

  get formItems() {
    return [
      {
        name: 'node_count',
        label: t('Node Count'),
        type: 'input-int',
        min: 1,
        required: true,
      },
    ];
  }

  onSubmit = (data) => {
    this.store.resize({ id: this.item.id }, data);
  };
}

export default inject('rootStore')(observer(Resize));
