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
import globalSnapshotStore from 'stores/cinder/snapshot';
import { isAvailableOrInUse } from 'resources/cinder/volume';
import globalProjectStore from 'stores/keystone/project';

const getQuota = (cinderQuota) => {
  const { snapshots: snapshotQuota = {} } = cinderQuota;
  const { currentVolumeType } = globalSnapshotStore;
  const typeQuota = cinderQuota[`snapshots_${currentVolumeType}`] || {};
  return {
    snapshotQuota,
    typeQuota,
  };
};

const getAdd = (cinderQuota) => {
  const { snapshotQuota, typeQuota } = getQuota(cinderQuota);
  const { left: totalLeft = 0 } = snapshotQuota || {};
  const { left: typeLeft = 0 } = typeQuota || {};
  return totalLeft !== 0 && typeLeft !== 0 ? 1 : 0;
};

export class CreateSnapshot extends ModalAction {
  static id = 'create-snapshot';

  static title = t('Create Volume Snapshot');

  static buttonText = t('Create Snapshot');

  init() {
    globalSnapshotStore.setCurrentVolumeType(this.item);
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.store = globalSnapshotStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
  }

  get name() {
    return t('create volume snapshot');
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
    };
    return value;
  }

  static policy = 'volume:create_snapshot';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

  static get disableSubmit() {
    const { cinderQuota = {} } = globalProjectStore;
    const add = getAdd(cinderQuota);
    return add === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    this.setState({
      quotaLoading: true,
    });
    const result = await this.projectStore.fetchProjectCinderQuota();
    this.setState({
      quota: result,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { snapshotQuota = {}, typeQuota = {} } = getQuota(quota);
    const add = getAdd(quota);
    const snapshotData = {
      ...snapshotQuota,
      add,
      name: 'snapshot',
      title: t('Volume Snapshot'),
    };
    const { volume_type } = this.item;
    const typeData = {
      ...typeQuota,
      add,
      name: 'type',
      title: t('{name} type snapshots', { name: volume_type }),
      type: 'line',
    };
    return [snapshotData, typeData];
  }

  get formItems() {
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'name',
        label: t('Volume Snapshot Name'),
        type: 'input-name',
        placeholder: t('Please input snapshot name'),
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { id, status } = this.item;
    const { name } = values;
    const data = {
      name,
      volume_id: id,
      force: status === 'in-use',
    };
    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(CreateSnapshot));
