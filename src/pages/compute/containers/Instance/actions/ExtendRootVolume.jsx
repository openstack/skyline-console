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
import { toJS } from 'mobx';
import globalServerStore from 'stores/nova/instance';
import globalVolumeStore from 'stores/cinder/volume';
import { InstanceVolumeStore } from 'stores/nova/instance-volume';
import { ModalAction } from 'containers/Action';
import { isNotLocked, checkStatus, isIronicInstance } from 'resources/instance';
import { isOsDisk } from 'resources/volume';

export class ExtendRootVolume extends ModalAction {
  static id = 'extend-root-volume';

  static title = t('Extend Root Volume');

  init() {
    this.store = globalServerStore;
    this.volumeStore = new InstanceVolumeStore();
    this.getVolumes();
  }

  async getVolumes() {
    const { id } = this.item;
    await this.volumeStore.fetchList({ serverId: id });
    this.updateDefaultValue();
  }

  get rootVolume() {
    const item = (this.volumeStore.list.data || []).find((it) => isOsDisk(it));
    return toJS(item) || {};
  }

  get name() {
    return t('Extend root volume');
  }

  getMinSize() {
    const { size = 1 } = this.rootVolume || {};
    return size + 1;
  }

  get defaultValue() {
    const { id, size = 1, name } = this.rootVolume || {};
    const { name: instance } = this.item;
    const value = {
      instance,
      volume: name || id,
      size: this.getMinSize(),
      oldSize: size,
    };
    return value;
  }

  static policy = 'volume:extend_attached_volume';

  static isAtiveOrShutOff = (item) => checkStatus(['active', 'shutoff'], item);

  static allowed = (item) =>
    Promise.resolve(
      isNotLocked(item) &&
        this.isAtiveOrShutOff(item) &&
        !isIronicInstance(item)
    );

  get formItems() {
    const minSize = this.getMinSize();
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'oldSize',
        label: t('Current Capacity (GB)'),
        type: 'label',
      },
      {
        name: 'size',
        label: t('Capacity (GB)'),
        type: 'slider-input',
        max: 500,
        min: minSize,
        description: `${minSize}GB-500GB`,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.rootVolume;
    const { size } = values;
    const body = {
      new_size: size,
    };
    return globalVolumeStore.extendSize(id, body);
  };
}

export default inject('rootStore')(observer(ExtendRootVolume));
