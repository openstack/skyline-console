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
import globalCloudKittyPyScriptStore from 'stores/cloudkitty/pyscript';

export class Edit extends ModalAction {
  static id = 'edit-pyscript';

  static title = t('Edit Script');

  static buttonText = t('Edit');

  get name() {
    return t('edit script');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { name, data } = this.item;
    return {
      name,
      data,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
      },
      {
        name: 'data',
        label: t('Script Data'),
        type: 'textarea',
        required: true,
        rows: 12,
      },
    ];
  }

  onSubmit = (values) =>
    globalCloudKittyPyScriptStore.update(
      { id: this.item.id },
      { name: this.item.name, data: values.data }
    );
}

export default inject('rootStore')(observer(Edit));
