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
import globalCloudKittyModuleStore from 'stores/cloudkitty/module';

export class EditPriority extends ModalAction {
  static id = 'edit-module-priority';

  static title = t('Edit Module Priority');

  static buttonText = t('Edit Priority');

  get name() {
    return t('edit module priority');
  }

  static policy = 'rating:update_module';

  get defaultValue() {
    const { id, priority } = this.item;
    return {
      module_id: id,
      priority,
    };
  }

  get formItems() {
    return [
      {
        name: 'module_id',
        label: t('Module'),
        type: 'label',
      },
      {
        name: 'priority',
        label: t('Priority'),
        type: 'input-number',
        min: 0,
        required: true,
      },
    ];
  }

  onSubmit = (values) =>
    globalCloudKittyModuleStore.updatePriority(
      { id: this.item.id },
      values.priority
    );
}

export default inject('rootStore')(observer(EditPriority));
