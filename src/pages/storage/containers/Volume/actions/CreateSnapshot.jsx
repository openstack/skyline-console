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
import globalVolumeTypeStore from 'stores/cinder/volume-type';

export class CreateSnapshot extends ModalAction {
  static id = 'create-snapshot';

  static title = t('Create Snapshot');

  init() {
    this.store = globalSnapshotStore;
    this.volumeTypeStore = globalVolumeTypeStore;
  }

  get name() {
    return t('create snapshot');
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GB)`,
    };
    return value;
  }

  static policy = 'volume:create_snapshot';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

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
        label: t('Snapshot Name'),
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
