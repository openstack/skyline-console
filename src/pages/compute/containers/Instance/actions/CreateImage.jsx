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
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';

export class CreateImage extends ModalAction {
  static id = 'create-image';

  static title = t('Create Image');

  init() {
    this.store = globalServerStore;
  }

  get name() {
    return t('Create Image');
  }

  get instanceName() {
    return this.values.name;
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      image: '',
    };
    return value;
  }

  static policy = 'os_compute_api:servers:create_image';

  static isRootVolumeReadyState = (item) => {
    const {
      root_device_name: rootDeviceName = '/dev/vda',
      volumes_attached: volumes = [],
    } = item;
    const rootVolume = volumes.find(
      (it) => it.is_root_volume || it.device === rootDeviceName
    );
    const { status } = rootVolume;
    return status === 'in-use' || status === 'available';
  };

  static allowed = (item) => {
    const result = this.isRootVolumeReadyState(item);
    return Promise.resolve(result);
  };

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'image',
        label: t('Image Name'),
        type: 'input-name',
        isImage: true,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { image } = values;
    const { id } = this.item;
    return this.store.createImage({ id, image });
  };
}

export default inject('rootStore')(observer(CreateImage));
