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
import globalVolumeStore, { VolumeStore } from 'stores/cinder/volume';
import globalProjectStore from 'stores/keystone/project';
import {
  isAvailableOrInUse,
  setCreateVolumeSize,
  checkQuotaDisable,
  getQuotaInfo,
  fetchQuota,
} from 'resources/cinder/volume';
import { isEmpty } from 'lodash';

export class ExtendVolume extends ModalAction {
  static id = 'extend-snapshot';

  static title = t('Extend Volume');

  get name() {
    return t('Extend volume');
  }

  static policy = 'volume:extend';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

  init() {
    this.store = globalVolumeStore;
    this.state.showNotice = true;
    this.volumeStore = new VolumeStore();
    this.projectStore = globalProjectStore;
    fetchQuota(this, 1, this.item.volume_type);
  }

  get tips() {
    return t('After the volume is expanded, the volume cannot be reduced.');
  }

  static get disableSubmit() {
    return checkQuotaDisable(false);
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading || isEmpty(quota)) {
      return [];
    }
    // eslint-disable-next-line no-unused-vars
    const [volumeData, sizeData, typeData, typeSizeData] = getQuotaInfo(
      this,
      false
    );
    const { type, ...rest } = sizeData;
    return [rest, typeSizeData];
  }

  get isQuotaLimited() {
    const { gigabytes: { limit } = {} } = this.projectStore.cinderQuota || {};
    return limit !== -1;
  }

  get leftSize() {
    const { gigabytes: { left = 0 } = {} } =
      this.projectStore.cinderQuota || {};
    return left;
  }

  get itemSize() {
    const { size } = this.item;
    return size;
  }

  get minSize() {
    return this.itemSize + 1;
  }

  get maxSize() {
    const { size: currentSize } = this.item;
    return currentSize + this.leftSize;
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
      new_size: this.minSize,
    };
    return value;
  }

  onSizeChange = (value) => {
    const add = value - this.itemSize;
    setCreateVolumeSize(add);
  };

  checkInstance = () => {
    const { lockedError } = this.state;
    if (!lockedError) {
      return Promise.resolve();
    }
    return Promise.reject(lockedError);
  };

  get formItems() {
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'new_size',
        label: t('Capacity (GiB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: this.minSize,
        description: `${this.minSize}GiB-${this.maxSize}GiB`,
        required: true,
        display: this.isQuotaLimited,
        onChange: this.onSizeChange,
        validator: this.checkInstance,
      },
      {
        name: 'new_size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: this.minSize,
        required: true,
        display: !this.isQuotaLimited,
        onChange: this.onSizeChange,
        validator: this.checkInstance,
      },
    ];
  }

  onSubmit = async (values) => {
    const { new_size } = values;
    const { id } = this.item;
    return this.store.extendSize(id, { new_size });
  };
}

export default inject('rootStore')(observer(ExtendVolume));
