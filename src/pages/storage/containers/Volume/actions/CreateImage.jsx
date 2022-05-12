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
import { volumeCreateImageTypes, imageOS } from 'resources/glance/image';
import globalVolumeStore from 'stores/cinder/volume';
import { isAvailable } from 'resources/cinder/volume';

export class CreateImage extends ModalAction {
  static id = 'create-image';

  static title = t('Create Image');

  get name() {
    return t('Create Image');
  }

  static policy = 'volume_extension:volume_actions:upload_image';

  static allowed = (item) => Promise.resolve(isAvailable(item));

  get defaultValue() {
    const value = {
      disk_format: 'raw',
    };
    return value;
  }

  get osList() {
    return Object.keys(imageOS).map((key) => ({
      value: key,
      label: imageOS[key],
    }));
  }

  get formatList() {
    return Object.keys(volumeCreateImageTypes).map((key) => ({
      label: volumeCreateImageTypes[key],
      value: key,
    }));
  }

  get formItems() {
    return [
      {
        name: 'image_name',
        label: t('Image Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        isImage: true,
        required: true,
      },
      {
        name: 'disk_format',
        label: t('Format'),
        type: 'select',
        options: this.formatList,
        required: true,
      },
    ];
  }

  init() {
    this.store = globalVolumeStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.uploadImage(id, values);
  };
}

export default inject('rootStore')(observer(CreateImage));
