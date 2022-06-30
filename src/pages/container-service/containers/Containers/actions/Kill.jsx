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

export class KillContainer extends ModalAction {
  static id = 'kill';

  static title = t('Kill Container');

  static buttonText = t('Kill');

  static policy = 'container:kill';

  static aliasPolicy = 'zun:container:kill';

  static allowed = (item) => checkItemAction(item, 'kill');

  get name() {
    return t('Kill Container');
  }

  get defaultValue() {
    const { name } = this.item;
    return {
      name,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'label',
      },
      {
        name: 'signal',
        label: t('Kill Signal'),
        type: 'input',
        placeholder: t('The kill signal to send'),
        tip: t(
          'Signal to send to the container: integer or string like SIGINT. When not set, SIGKILL is set as default value and the container will exit. The supported signals varies between platform. Besides, you can omit "SIG" prefix.'
        ),
      },
    ];
  }

  onSubmit = (values) => {
    const { uuid } = this.item;
    const { signal } = values;
    return globalContainersStore.kill(uuid, { signal });
  };
}

export default inject('rootStore')(observer(KillContainer));
