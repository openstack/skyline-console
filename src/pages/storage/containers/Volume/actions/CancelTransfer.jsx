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
import globalVolumeStore from 'stores/cinder/volume';

export default class CancelTransfer extends ConfirmAction {
  get id() {
    return 'cancel-transfer';
  }

  get title() {
    return t('Cancel Transfer');
  }

  get name() {
    return t('Cancel Transfer');
  }

  get buttonText() {
    return t('Cancel Transfer');
  }

  get actionName() {
    return t('Cancel Transfer');
  }

  policy = 'volume:delete_transfer';

  allowedCheckFunc = (item) =>
    Promise.resolve(item.status === 'awaiting-transfer');

  confirmContext = ({ name }) =>
    t('Are you sure to cancel transfer volume { name }? ', { name });

  onSubmit = (data) => {
    const { id } = data;
    return globalVolumeStore.cancelTransfer({ id });
  };
}
