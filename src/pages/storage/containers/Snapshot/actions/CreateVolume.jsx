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

export class CreateVolume extends ModalAction {
  static id = 'create';

  static title = t('Create Volume');

  init() {
    this.volumeStore = globalVolumeStore;
    this.getVolumeTypes();
  }

  get name() {
    return t('create volume');
  }

  static policy = 'volume:create';

  static allowed = () => Promise.resolve(true);

  get volumeTypeParams() {
    return {};
  }

  async getVolumeTypes() {
    const { volume_id: id } = this.item;
    // eslint-disable-next-line no-unused-vars
    const [_, volume] = await Promise.all([
      this.volumeStore.fetchVolumeTypes(this.volumeTypeParams),
      this.volumeStore.fetchDetail({ id }),
    ]);
    const { volume_type: volumeType } = volume;
    const typeItem = this.volumeTypes.find((it) => it.label === volumeType);
    if (typeItem) {
      this.volumeType = typeItem.value;
    }
    this.updateFormValue('volume_type', this.volumeType);
  }

  get volumeTypes() {
    return this.volumeStore.volumeTypes || [];
  }

  get defaultValue() {
    const { name, size } = this.item;
    const value = {
      snapshot: name,
      size,
      volume_type: this.volumeType,
    };
    return value;
  }

  get minSize() {
    return this.item.size;
  }

  get formItems() {
    const { more } = this.state;
    return [
      {
        name: 'snapshot',
        label: t('Snapshot'),
        type: 'label',
        iconType: 'snapshot',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: this.minSize,
        extra: `${t('Min size')}: ${this.minSize}GiB`,
        required: true,
      },
      {
        name: 'more',
        type: 'more',
        label: t('Advanced Options'),
      },
      {
        name: 'volume_type',
        label: t('Volume Type'),
        type: 'select',
        options: this.volumeTypes,
        placeholder: t('Please select volume type'),
        hidden: !more,
      },
    ];
  }

  onSubmit = ({ name, size, volume_type }) => {
    const {
      item: { id },
    } = this;
    const body = { name, size, snapshot_id: id };
    if (volume_type) {
      body.volume_type = volume_type;
    } else {
      body.volume_type = this.volumeType;
    }
    return globalVolumeStore.create(body);
  };
}

export default inject('rootStore')(observer(CreateVolume));
