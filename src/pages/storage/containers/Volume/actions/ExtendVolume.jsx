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
import { isAvailableOrInUse } from 'resources/cinder/volume';
import { get } from 'lodash';
import client from 'client';
import Notify from 'components/Notify';

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

  async getQuota() {
    await this.volumeStore.fetchQuota();
    this.updateDefaultValue();
  }

  get isQuotaLimited() {
    const { gigabytes: { limit } = {} } = this.volumeStore.quotaSet || {};
    return limit !== -1;
  }

  get leftSize() {
    const { gigabytes: { limit = 10, in_use = 0 } = {} } =
      this.volumeStore.quotaSet || {};
    return limit - in_use;
  }

  get maxSize() {
    const { size: currentSize } = this.item;
    return currentSize + this.leftSize;
  }

  isQuotaEnough() {
    return !this.isQuotaLimited || this.leftSize >= 1;
  }

  get formItems() {
    const { size } = this.item;
    const minSize = size + 1;
    if (!this.isQuotaEnough()) {
      return [
        {
          type: 'label',
          component: t('Quota is not enough for extend volume.'),
        },
      ];
    }
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
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GB-${this.maxSize}GB`,
        required: true,
        display: this.isQuotaLimited,
      },
      {
        name: 'new_size',
        label: t('Capacity (GB)'),
        type: 'input-int',
        min: minSize,
        required: true,
        display: !this.isQuotaLimited,
      },
    ];
  }

  init() {
    this.store = globalVolumeStore;
    this.state.showNotice = true;
    this.volumeStore = new VolumeStore();

    this.getQuota();
  }

  get showNotice() {
    return this.state.showNotice;
  }

  onSubmit = async (values) => {
    if (!this.isQuotaEnough()) {
      this.setState({
        showNotice: false,
      });
      return Promise.resolve();
    }

    const { new_size } = values;
    const { id } = this.item;

    const instanceId = get(this.item, 'attachments[0].server_id');
    if (instanceId) {
      const { server } = await client.nova.servers.show(instanceId);
      if (server.locked) {
        Notify.errorWithDetail(
          t('The server {name} is locked. Please unlock first.', {
            name: server.name,
          }),
          t('The server {name} is locked. Please unlock first.', {
            name: server.name,
          })
        );
        this.setState({
          showNotice: false,
        });
        return;
      }
    }
    return this.store.extendSize(id, { new_size });
  };
}

export default inject('rootStore')(observer(ExtendVolume));
