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

export class CreateThreshold extends ModalAction {
  static id = 'create-hashmap-threshold';

  static title = t('Create Threshold');

  static buttonText = t('Create Threshold');

  get name() {
    return t('create threshold');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return { type: 'flat' };
  }

  get formItems() {
    return thresholdFormItems;
  }

  // The parent hashmap service this threshold belongs to.
  get serviceId() {
    const { detail, match } = this.containerProps || {};
    return detail?.id || match?.params?.id;
  }

  onSubmit = (values) =>
    globalCloudKittyHashMapThresholdStore.create({
      ...values,
      service_id: this.serviceId,
    });
}

export default inject('rootStore')(observer(CreateThreshold));
