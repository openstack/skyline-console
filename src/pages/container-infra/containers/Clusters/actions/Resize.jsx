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

export class ResizeClusters extends ModalAction {
  init() {
    this.store = globalClustersStore;
  }

  static id = 'resize-cluster';

  static title = t('Resize Cluster');

  policy = 'container-infra:cluster:resize';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Resize Cluster');
  }

  get buttonText() {
    return t('Resize');
  }

  get formItems() {
    return [
      {
        name: 'node_count',
        label: t('Instance'),
        type: 'input-number',
        min: 1,
        required: true,
      },
    ];
  }

  onSubmit = (data) => {
    this.store.update(
      { id: this.props.item.uuid },
      { node_count: data.node_count }
    );
  };
}

export default inject("rootStore")(observer(ResizeClusters))
