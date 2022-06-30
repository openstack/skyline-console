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
import globalShareStore from 'stores/manila/share';

export class ExtendShare extends ModalAction {
  static id = 'extend-share';

  static title = t('Extend Share');

  get name() {
    return t('Extend Share');
  }

  get defaultValue() {
    const { name, id, size } = this.item;
    const value = {
      share: `${name || id}(${size}GiB)`,
      new_size: size + 1,
    };
    return value;
  }

  static policy = 'share:extend';

  static allowed = (item) => Promise.resolve(item.isMine);

  get tips() {
    return t('After the share is expanded, the share cannot be reduced.');
  }

  async getQuota() {
    await this.store.fetchQuota();
    this.updateDefaultValue();
  }

  get isQuotaLimited() {
    const { gigabytes: { limit } = {} } = this.store.quotaSet || {};
    return limit !== -1;
  }

  get leftSize() {
    const { gigabytes: { limit = 10, in_use = 0, reserved = 0 } = {} } =
      this.store.quotaSet || {};
    return limit - in_use - reserved;
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
          component: t('Quota is not enough for extend share.'),
        },
      ];
    }
    return [
      {
        name: 'share',
        label: t('Share'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'new_size',
        label: t('Capacity (GiB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GiB-${this.maxSize}GiB`,
        required: true,
        display: this.isQuotaLimited,
      },
      {
        name: 'new_size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: minSize,
        required: true,
        display: !this.isQuotaLimited,
      },
    ];
  }

  init() {
    this.store = globalShareStore;
    this.getQuota();
  }

  onSubmit = async (values) => {
    const { new_size } = values;
    const { id } = this.item;

    return this.store.extendSize(id, { new_size });
  };
}

export default inject('rootStore')(observer(ExtendShare));
