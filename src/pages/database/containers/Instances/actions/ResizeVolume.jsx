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
import globalTroveInstanceStore from 'stores/trove/instances';
import globalProjectStore from 'stores/keystone/project';
import { ModalAction } from 'containers/Action';
import { checkStatus } from 'resources/nova/instance';

const getNoLeftQuota = (quota) => {
  const { volumes: { left: volumeLeft = 0 } = {} } = quota || {};
  return volumeLeft === 0;
};

export class ResizeVolume extends ModalAction {
  static id = 'resize-volume';

  static title = t('Resize Volume');

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.store = globalTroveInstanceStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
    this.state.isLoading = true;
    this.errorMsg = '';
  }

  get isQuotaLimited() {
    const { volumes: { limit } = {} } = this.projectStore.troveQuota || {};
    return limit !== -1;
  }

  get maxSize() {
    const { volumes: { left = 0 } = {} } = this.projectStore.troveQuota || {};
    const { size = 0 } = this.item;
    return left + size;
  }

  isQuotaEnough() {
    const { size = 0 } = this.item;
    return !this.isQuotaLimited || this.maxSize > size;
  }

  get name() {
    return t('Resize Volume');
  }

  getMinSize() {
    const { volume = {} } = this.item;
    const { size = 1 } = volume;
    return size + 1;
  }

  static get disableSubmit() {
    const { troveQuota = {} } = globalProjectStore;
    const disableAdd = getNoLeftQuota(troveQuota);
    return disableAdd;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    await this.projectStore.fetchProjectTroveQuota(this.currentProjectId);
    this.setState({
      isLoading: false,
    });
  }

  get quotaInfo() {
    if (this.state.isLoading) {
      return [];
    }
    const { volumes = {} } = this.projectStore.troveQuota || {};

    const { size = 0 } = this.state;
    const { left: volumeLeft = 0 } = volumes;
    const { size: currentSize = 0 } = this.item;
    const addSize = size - currentSize;

    const volumeSizeQuotaInfo = {
      ...volumes,
      add: volumeLeft === -1 || addSize <= volumeLeft ? addSize : 0,
      name: 'volumeSize',
      title: t('Database Disk (GiB)'),
      type: 'ring',
    };

    return [volumeSizeQuotaInfo];
  }

  get isAsyncAction() {
    return true;
  }

  get nameForStateUpdate() {
    return ['size'];
  }

  get defaultValue() {
    const { name: instance, volume = {} } = this.item;
    const value = {
      instance,
      size: this.getMinSize(),
      oldSize: volume.size,
    };
    return value;
  }

  static policy = ['trove:instance:resize_volume', 'trove:admin'];

  static isActiveOrShutOff = (item) => checkStatus(['active', 'shutoff'], item);

  static allowed = (item) => Promise.resolve(this.isActiveOrShutOff(item));

  get formItems() {
    if (this.state.isLoading) {
      return [];
    }
    if (!this.isQuotaEnough()) {
      return [
        {
          type: 'label',
          component: t('Quota is not enough for extend volume.'),
        },
      ];
    }
    const minSize = this.getMinSize();

    return [
      {
        name: 'instance',
        label: t('Database Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'oldSize',
        label: t('Current Disk (GiB)'),
        type: 'label',
      },
      {
        name: 'size',
        label: t('Database Disk (GiB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GiB-${this.maxSize}GiB`,
        required: true,
        display: this.isQuotaLimited,
      },
      {
        name: 'size',
        label: t('Database Disk (GiB)'),
        type: 'input-int',
        min: minSize,
        required: true,
        display: !this.isQuotaLimited,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { size } = values;
    return globalTroveInstanceStore.resizeVolume({ id, size });
  };
}

export default inject('rootStore')(observer(ResizeVolume));
