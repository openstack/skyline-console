// Copyright 2021 99cloud
//
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

import { ConfirmAction } from 'containers/Action';
import { hasEncryption } from 'resources/cinder/volume-type';
import globalVolumeTypeStore from 'stores/cinder/volume-type';

export default class DeleteEncryptionAction extends ConfirmAction {
  get id() {
    return 'delete-encryption';
  }

  get title() {
    return t('Delete Encryption');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete Encryption');
  }

  get actionName() {
    return t('Delete Encryption');
  }

  policy = 'volume_extension:volume_type_encryption:delete';

  allowedCheckFunc = (data) => hasEncryption(data);

  onSubmit = () => {
    const { id, encryption } = this.item;
    return globalVolumeTypeStore.deleteEncryption(id, encryption.encryption_id);
  };
}
