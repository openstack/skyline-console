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
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalSnapshotStore from 'stores/cinder/snapshot';
import { isAvailableOrInUse, isOsDisk } from 'resources/cinder/volume';

export class ChangeType extends ModalAction {
  static id = 'change-type';

  static title = t('Change Type');

  get name() {
    return t('Change Type');
  }

  static policy = 'volume:retype';

  static allowed = (item) =>
    Promise.resolve(isAvailableOrInUse(item) && !isOsDisk(item));

  get tips() {
    return t(
      'If the capacity of the disk is large, the type modify operation may take several hours. Please be cautious.'
    );
  }

  init() {
    this.store = globalVolumeStore;
    this.volumeTypeStore = globalVolumeTypeStore;
    this.getVolumeTypes();
  }

  getVolumeTypes() {
    this.volumeTypeStore.fetchList();
  }

  get isAsyncAction() {
    return true;
  }

  get volumeTypes() {
    const { volume_type } = this.item;
    const { data = [] } = this.volumeTypeStore.list;
    const list = data
      .filter((it) => it.name !== volume_type)
      .map((item) =>
        // TODO: filter no current volume type
        ({ label: item.name, value: item.id })
      );
    return list;
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
      volume_type: (this.volumeTypes[0] || {}).value,
    };
    return value;
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
        name: 'new_type',
        label: t('Volume Type'),
        type: 'select',
        required: true,
        options: this.volumeTypes,
      },
    ];
  }

  onSubmit = async (values) => {
    const { id, name } = this.item;
    const { new_type } = values;

    try {
      const snapshots = (await globalSnapshotStore.fetchList({ id })) || [];
      const invalidStatuses = ['error', 'error_deleting', 'deleting'];
      const activeSnapshots = snapshots.filter(
        (snapshot) => !invalidStatuses.includes(snapshot.status)
      );
      if (activeSnapshots.length > 0) {
        const errorMessage = t(
          'Volume "{name}" cannot be retyped because it has {count} active snapshot(s). To change the volume type, you must first remove all existing snapshots. If you need to preserve the data in the snapshots, you can create new volumes from them first.',
          { name: name || id, count: activeSnapshots.length }
        );
        const error = new Error(errorMessage);
        error.response = { data: errorMessage };
        throw error;
      }
    } catch (error) {
      if (
        error.response?.data ||
        error.message?.includes('cannot be retyped')
      ) {
        throw error;
      }
    }

    return this.store.retype(id, {
      new_type,
      migration_policy: 'on-demand',
    });
  };
}

export default inject('rootStore')(observer(ChangeType));
