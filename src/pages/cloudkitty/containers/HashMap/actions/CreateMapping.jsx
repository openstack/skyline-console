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

export class CreateMapping extends ModalAction {
  static id = 'create-hashmap-mapping';

  static title = t('Create Mapping');

  static buttonText = t('Create Mapping');

  get name() {
    return t('create mapping');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return { type: 'flat' };
  }

  get formItems() {
    return mappingFormItems;
  }

  // The parent hashmap service this mapping belongs to.
  get serviceId() {
    const { detail, match } = this.containerProps || {};
    return detail?.id || match?.params?.id;
  }

  onSubmit = (values) =>
    globalCloudKittyHashMapMappingStore.create({
      ...values,
      service_id: this.serviceId,
    });
}

export default inject('rootStore')(observer(CreateMapping));
