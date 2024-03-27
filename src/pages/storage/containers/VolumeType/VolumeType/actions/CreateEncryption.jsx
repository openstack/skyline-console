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
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import { hasEncryption } from 'resources/cinder/volume-type';

export class CreateEncryption extends ModalAction {
  static id = 'create';

  static title = t('Create Encryption');

  get name() {
    return t('create encryption');
  }

  static policy = 'volume_extension:volume_type_encryption:create';

  static allowed = (item) => Promise.resolve(!hasEncryption(item));

  get defaultValue() {
    const { name } = this.item;
    const value = {
      name,
    };
    return value;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Volume Type'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'provider',
        label: t('Provider'),
        type: 'input',
        placeholder: t('Please input provider'),
        extra: t(
          'The Provider is the encryption provider format (e.g. "luks")'
        ),
        required: true,
        style: {
          width: '100%',
        },
      },
      {
        name: 'control_location',
        label: t('Control Location'),
        type: 'select',
        options: [
          { value: 'front-end', label: t('Front End') },
          { value: 'back-end', label: t('Back End') },
        ],
        required: true,
      },
      {
        name: 'cipher',
        label: t('Cipher'),
        type: 'input',
        placeholder: t('Please input cipher'),
      },
      {
        name: 'key_size',
        label: t('Key Size (bits)'),
        type: 'input-int',
        placeholder: t('Please input key size'),
        style: {
          width: '100%',
        },
      },
    ];
  }

  init() {
    this.store = globalVolumeTypeStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.createEncryption(id, values);
  };
}

export default inject('rootStore')(observer(CreateEncryption));
