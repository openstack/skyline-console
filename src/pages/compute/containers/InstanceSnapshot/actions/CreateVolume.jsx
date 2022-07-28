// Copyright 2022 99cloud
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
import { ModalAction } from 'containers/Action';
import globalVolumeStore from 'stores/cinder/volume';
import { InstanceSnapshotStore } from 'stores/glance/instance-snapshot';
import {
  getQuotaInfo,
  checkQuotaDisable,
  fetchQuota,
  setCreateVolumeType,
  onVolumeSizeChange,
  onVolumeTypeChange,
} from 'resources/cinder/volume';

export class CreateVolume extends ModalAction {
  static id = 'create';

  static title = t('Create Volume');

  init() {
    this.volumeStore = globalVolumeStore;
    this.snapshotStore = new InstanceSnapshotStore();
    this.getVolumeTypes();
    this.getMinSize();
  }

  get name() {
    return t('Create Volume');
  }

  get instanceName() {
    return this.values.name;
  }

  static policy = 'volume:create_from_image';

  static allowed = () => Promise.resolve(true);

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

  async getVolumeTypes() {
    const { id } = this.item;
    // eslint-disable-next-line no-unused-vars
    const [_, snapshot] = await Promise.all([
      this.volumeStore.fetchVolumeTypes(),
      this.snapshotStore.fetchDetail({ id }),
    ]);
    const { volumeDetail: { volume_type: volumeType } = {} } = snapshot;
    const typeItem = this.volumeTypes.find((it) => it.label === volumeType);
    if (typeItem) {
      this.volumeType = typeItem.value;
      setCreateVolumeType(volumeType);
    }
    this.updateFormValue('volume_type', this.volumeType);
  }

  async getMinSize() {
    const { id } = this.item;
    if (this.snapshot && this.snapshot.volume_size) {
      fetchQuota(this, this.minSize);
      return;
    }
    await this.snapshotStore.fetchDetail({ id });
    fetchQuota(this, this.minSize);
    this.updateDefaultValue();
  }

  get volumeTypes() {
    return this.volumeStore.volumeTypes;
  }

  get tips() {
    return t(
      'Snapshots can be converted into volume and used to create an instance from the volume.'
    );
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      snapshot: name,
      size: this.minSize,
      volume_type: this.volumeType,
    };
    return value;
  }

  get bdmData() {
    const { block_device_mapping: bdm = '[]' } = this.item;
    return JSON.parse(bdm);
  }

  get snapshot() {
    return this.bdmData.find((it) => it.boot_index === 0);
  }

  get minSize() {
    const { min_disk, size } = this.item;
    const biggerSize = Math.max(
      min_disk,
      Math.ceil(size / 1024 / 1024 / 1024),
      1,
      (this.snapshot || {}).volume_size || 1
    );
    if (biggerSize) {
      return biggerSize;
    }
    const { snapshotDetail: { size: snapshotSize = 0 } = {} } =
      toJS(this.snapshotStore.detail) || {};
    return Math.max(snapshotSize, 1);
  }

  get formItems() {
    const { more } = this.state;
    return [
      {
        name: 'snapshot',
        label: t('Volume Snapshot'),
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
        placeholder: t('Please select volume type'),
        hidden: !more,
        onChange: onVolumeTypeChange,
      },
    ];
  }

  onSubmit = ({ name, size, volume_type }) => {
    const body = {
      imageRef: this.item.id,
      name,
      size,
    };
    if (volume_type) {
      body.volume_type = volume_type;
    } else {
      body.volume_type = this.volumeType;
    }
    return globalVolumeStore.create(body);
  };
}

export default inject('rootStore')(observer(CreateVolume));
