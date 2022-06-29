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
import globalRootStore from 'stores/root';
import {
  getQuotaInfo,
  checkQuotaDisable,
  fetchQuota,
  onVolumeSizeChange,
  onVolumeTypeChange,
} from 'resources/cinder/volume';

export class CreateVolume extends ModalAction {
  static id = 'create';

  static title = t('Create Volume');

  init() {
    this.volumeStore = globalVolumeStore;
    this.getVolumeTypes();
    const size = this.getMinSize();
    fetchQuota(this, size);
  }

  static policy = 'volume:create_from_image';

  static allowed = (_, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      globalRootStore.checkEndpoint('cinder') && !isAdminPage
    );
  };

  getVolumeTypes() {
    this.volumeStore.fetchVolumeTypes();
  }

  get volumeTypes() {
    return this.volumeStore.volumeTypes;
  }

  getMinSize() {
    const { min_disk, size } = this.item;
    return Math.max(min_disk, Math.ceil(size / 1024 / 1024 / 1024));
  }

  get name() {
    return t('Create Volume');
  }

  get instanceName() {
    return this.values.name;
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
    const { name } = this.item;
    const value = {
      image: name,
      size: this.getMinSize(),
    };
    return value;
  }

  get formItems() {
    const minSize = this.getMinSize();
    return [
      {
        name: 'image',
        label: t('Image'),
        type: 'label',
        iconType: 'image',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'volume_type',
        label: t('Volume Type'),
        type: 'select',
        required: true,
        options: this.volumeTypes,
        placeholder: t('Please select volume type'),
        onChange: onVolumeTypeChange,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: minSize,
        extra: `${t('Min size')}: ${minSize}GiB`,
        required: true,
        onChange: onVolumeSizeChange,
      },
    ];
  }

  onSubmit = ({ name, size, volume_type }) => {
    const body = {
      imageRef: this.item.id,
      name,
      size,
      volume_type,
    };
    return globalVolumeStore.create(body);
  };
}

export default inject('rootStore')(observer(CreateVolume));
