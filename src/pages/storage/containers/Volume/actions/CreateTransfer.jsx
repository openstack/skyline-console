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
import { isAvailable } from 'resources/cinder/volume';

export class CreateTransfer extends ModalAction {
  static id = 'create-transfer';

  static title = t('Create Transfer');

  get name() {
    return t('Create Transfer');
  }

  static policy = 'volume:create_transfer';

  static allowed = (item) =>
    Promise.resolve(isAvailable(item) && !item.encrypted);

  get defaultValue() {
    return { name: '' };
  }

  get tips() {
    return t(
      'Ownership of a volume can be transferred from one project to another. The transfer process of the volume needs to perform the transfer operation in the original owner\'s project, and complete the "accept" operation in the receiver\'s project.'
    );
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Transfer Name'),
        type: 'input-name',
        required: true,
        placeholder: t('Please input name'),
      },
    ];
  }

  init() {
    this.store = globalVolumeStore;
  }

  downloadTxt = (fileName, content) => {
    const a = document.createElement('a');
    a.href = `data:text/plain;charset=utf-8,${content}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  onSubmit = ({ name }) => {
    const { id } = this.item;
    return this.store.createTransfer({ name, volume_id: id }).then((data) => {
      if (data && data.transfer) {
        const {
          id: transfer_id,
          name: transfer_name,
          auth_key,
        } = data.transfer;
        this.downloadTxt(
          `Volume Transfer ${transfer_id}.txt`,
          `Transfer Name: ${transfer_name}\nTransfer ID: ${transfer_id}\nAuth Key: ${auth_key}`
        );
      }
    });
  };
}

export default inject('rootStore')(observer(CreateTransfer));
