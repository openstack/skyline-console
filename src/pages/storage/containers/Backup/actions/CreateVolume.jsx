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
  getQuotaInfo,
  checkQuotaDisable,
  fetchQuota,
  onVolumeSizeChange,
  onVolumeTypeChange,
} from 'resources/cinder/volume';

export class CreateVolume extends ModalAction {
  static id = 'create';

  static title = t('Create Volume');

  get name() {
    return t('Create volume');
  }

  static policy = 'volume:create';

  static aliasPolicy = 'cinder:volume:create';

  init() {
    this.volumeStore = globalVolumeStore;
    this.getAvailZones();
    this.getVolumeTypes();
    fetchQuota(this, this.item.size);
  }

  getAvailZones() {
    this.volumeStore.fetchAvailabilityZoneList();
  }

  getVolumeTypes() {
    this.volumeStore.fetchVolumeTypes();
  }

  get availableZones() {
    const availableZonesList = [{ label: t('Not select'), value: 'noSelect' }];
    (this.volumeStore.availabilityZones || [])
      .filter((it) => it.zoneState.available)
      .forEach((it) => {
        availableZonesList.push({
          value: it.zoneName,
          label: it.zoneName,
        });
      });
    return availableZonesList;
  }

  get volumeTypes() {
    return this.volumeStore.volumeTypes;
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

  static allowed = (item) => Promise.resolve(item.status === 'available');

  get defaultValue() {
    const { name: backupName, size } = this.item;
    const value = {
      size,
      backupName,
    };
    return value;
  }

  get minSize() {
    return this.item.size;
  }

  get formItems() {
    return [
      {
        name: 'backupName',
        label: t('Volume Backup'),
        type: 'label',
        iconType: 'backup',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
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
        name: 'volume_type',
        label: t('Volume Type'),
        type: 'select',
        required: true,
        options: this.volumeTypes,
        placeholder: t('Please select volume type'),
        onChange: onVolumeTypeChange,
      },
      {
        name: 'availability_zone',
        label: t('Availability Zone'),
        type: 'select',
        options: this.availableZones,
        required: true,
        placeholder: t('Please select availability zone'),
      },
    ];
  }

  onSubmit = (values) => {
    const { backupName, availability_zone, ...rest } = values;
    const body = {
      backup_id: this.item.id,
      availability_zone:
        availability_zone !== 'noSelect' ? availability_zone : null,
      ...rest,
    };
    return globalVolumeStore.create(body);
  };
}

export default inject('rootStore')(observer(CreateVolume));
