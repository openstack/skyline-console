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
import { isAvailableOrInUse } from 'resources/cinder/volume';

export class CloneVolume extends ModalAction {
  static id = 'clone-volume';

  static title = t('Clone Volume');

  get name() {
    return t('Clone volume');
  }

  get tips() {
    return t(
      'It is recommended that you perform this cloning operation on a disk without any reading/writing'
    );
  }

  static policy = 'volume:create';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

  init() {
    this.store = globalVolumeStore;
    this.getVolumeTypes();
  }

  async getVolumeTypes() {
    await this.store.fetchVolumeTypes();
  }

  get volumeTypes() {
    return this.store.volumeTypes;
  }

  get formItems() {
    return [
      {
        name: 'volume',
        label: t('Volume Name'),
        type: 'input-name',
        required: true,
      },
    ];
  }

  onSubmit = ({ volume }) => {
    const {
      item: { size, id, volume_type },
    } = this;
    const type = this.volumeTypes.find((it) => it.label === volume_type);
    const body = {
      name: volume,
      size,
      source_volid: id,
      volume_type: type.value,
    };
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(CloneVolume));
