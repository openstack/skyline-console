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
import globalCloudKittyHashMapThresholdStore from 'stores/cloudkitty/hashmapThreshold';
import { thresholdFormItems } from './costFormItems';

export class EditThreshold extends ModalAction {
  static id = 'edit-hashmap-threshold';

  static title = t('Edit Threshold');

  static buttonText = t('Edit');

  get name() {
    return t('edit threshold');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { level, cost, type } = this.item;
    return { level, cost, type };
  }

  get formItems() {
    return thresholdFormItems;
  }

  onSubmit = (values) =>
    globalCloudKittyHashMapThresholdStore.update({ id: this.item.id }, values);
}

export default inject('rootStore')(observer(EditThreshold));
