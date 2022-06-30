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
import {
  isAvailableOrInUse,
  getQuotaInfo,
  checkQuotaDisable,
  fetchQuota,
  onVolumeSizeChange,
  onVolumeTypeChange,
  setCreateVolumeType,
} from 'resources/cinder/volume';

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
    fetchQuota(this, this.item.size);
  }

  async getVolumeTypes() {
    await this.store.fetchVolumeTypes();
    const defaultType = this.volumeTypes.find(
      (it) => it.label === this.item.volume_type
    );
    this.defaultType = defaultType;
    if (defaultType) {
      setCreateVolumeType(this.item.volume_type);
    }
    this.updateDefaultValue();
  }

  get volumeTypes() {
    return this.store.volumeTypes;
  }

  static get disableSubmit() {
    return checkQuotaDisable();
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    return getQuotaInfo(this);
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
      volume_type: (this.defaultType || {}).value,
      size,
    };
    return value;
  }

  get maxSize() {
    const { quota: { gigabytes: { left = 0 } = {} } = {} } = this.state;
    return left === -1 ? Infinity : left;
  }

  get formItems() {
    const { size } = this.item;
    const { more } = this.state;
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'name',
        label: t('Volume Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: size,
        max: this.maxSize,
        required: true,
        onChange: onVolumeSizeChange,
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
        onChange: onVolumeTypeChange,
        allowClear: false,
        hidden: !more,
      },
    ];
  }

  onSubmit = (values) => {
    const { volume, more, ...rest } = values;
    const body = {
      ...rest,
      source_volid: this.item.id,
    };
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(CloneVolume));
