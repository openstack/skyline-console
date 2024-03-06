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
import { isAvailableOrInUse, isOsDisk } from 'resources/cinder/volume';

export class ChangeType extends ModalAction {
  static id = 'change-type';

  static title = t('Change Type');

  get name() {
    return t('Change type');
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

  onSubmit = (values) => {
    const { id } = this.item;
    const { new_type } = values;
    const body = {
      new_type,
      migration_policy: 'on-demand',
    };
    return this.store.retype(id, body);
  };
}

export default inject('rootStore')(observer(ChangeType));
