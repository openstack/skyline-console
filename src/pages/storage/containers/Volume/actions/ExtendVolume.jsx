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
import { isAvailableOrInUse } from 'resources/volume';

export class ExtendVolume extends ModalAction {
  static id = 'extend-snapshot';

  static title = t('Extend Volume');

  get name() {
    return t('Extend volume');
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GB)`,
      new_size: size + 1,
    };
    return value;
  }

  static policy = 'volume:extend';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

  get tips() {
    return t('After the volume is expanded, the volume cannot be reduced.');
  }

  get formItems() {
    const { size } = this.item;
    const minSize = size + 1;
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'new_size',
        label: t('Capacity (GB)'),
        type: 'slider-input',
        max: 500,
        min: minSize,
        description: `${minSize}GB-500GB`,
        required: true,
      },
    ];
  }

  init() {
    this.store = globalVolumeStore;
  }

  onSubmit = (values) => {
    const { volume, ...rest } = values;
    const { id } = this.item;
    return this.store.extendSize(id, rest);
  };
}

export default inject('rootStore')(observer(ExtendVolume));
