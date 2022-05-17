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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalVolumeStore from 'stores/cinder/volume';

export class AcceptVolumeTransfer extends ModalAction {
  static id = 'accept-volume-transfer';

  static title = t('Accept Volume Transfer');

  get name() {
    return t('Accept Volume Transfer');
  }

  get defaultValue() {
    const value = {};
    return value;
  }

  get messageHasItemName() {
    return false;
  }

  static policy = () => 'volume:accept_transfer';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'transfer_id',
        label: t('Transfer ID'),
        type: 'input',
        placeholder: t('Please input transfer id'),
        required: true,
      },
      {
        name: 'auth_key',
        label: t('Auth Key'),
        type: 'input',
        placeholder: t('Please input auth key'),
        required: true,
      },
    ];
  }

  onSubmit = ({ transfer_id, auth_key }) =>
    globalVolumeStore.acceptVolumeTransfer(transfer_id, { auth_key });
}

export default inject('rootStore')(observer(AcceptVolumeTransfer));
