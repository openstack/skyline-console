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
import globalContainersStore from 'src/stores/zun/containers';
import { checkItemAction } from 'resources/zun/container';

export class EditContainer extends ModalAction {
  static id = 'edit';

  static title = t('Edit Container');

  static buttonText = t('Edit');

  static policy = 'container:update';

  static aliasPolicy = 'zun:container:update';

  static allowed = (item) => checkItemAction(item, 'update');

  get name() {
    return t('Edit Container');
  }

  get defaultValue() {
    const { name, memory, cpu } = this.item;
    return {
      name,
      cpu,
      memory,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'input',
        placeholder: t('Container Name'),
        required: true,
      },
      {
        name: 'cpu',
        label: t('CPU (Core)'),
        type: 'input-int',
        tip: t('The number of virtual cpu for this container'),
        min: 1,
      },
      {
        name: 'memory',
        label: t('Memory (MiB)'),
        type: 'input-int',
        tip: t('The container memory size in MiB'),
        min: 4,
      },
    ];
  }

  onSubmit = (values) => {
    const { uuid } = this.item;
    return globalContainersStore.patch({ id: uuid }, values);
  };
}

export default inject('rootStore')(observer(EditContainer));
