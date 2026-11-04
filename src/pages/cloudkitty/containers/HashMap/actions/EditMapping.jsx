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
import globalCloudKittyHashMapMappingStore from 'stores/cloudkitty/hashmapMapping';
import { mappingFormItems } from './costFormItems';

export class EditMapping extends ModalAction {
  static id = 'edit-hashmap-mapping';

  static title = t('Edit Mapping');

  static buttonText = t('Edit');

  get name() {
    return t('edit mapping');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { value, cost, type } = this.item;
    return { value, cost, type };
  }

  get formItems() {
    return mappingFormItems;
  }

  onSubmit = (values) =>
    globalCloudKittyHashMapMappingStore.update({ id: this.item.id }, values);
}

export default inject('rootStore')(observer(EditMapping));
