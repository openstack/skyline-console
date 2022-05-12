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
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { checkStatus, isIronicInstance } from 'resources/nova/instance';
import globalInstanceVolumeStore from 'stores/nova/instance-volume';
import globalVolumeTypeStore from 'stores/cinder/volume-type';

export class CreateSnapshot extends ModalAction {
  static id = 'create-snapshot';

  static title = t('Create Snapshot');

  init() {
    this.store = globalServerStore;
    this.volumeStore = globalInstanceVolumeStore;
    this.volumeTypeStore = globalVolumeTypeStore;
  }

  get name() {
    return t('create instance snapshot');
  }

  get tips() {
    return t(
      'A snapshot is an image which preserves the disk state of a running instance, which can be used to start a new instance.'
    );
  }

  get instanceName() {
    return this.values.snapshot;
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      snapshot: '',
    };
    return value;
  }

  static isSnapshotReadyState = (item) =>
    checkStatus(['active', 'shutoff', 'suspended'], item);

  static policy = 'os_compute_api:servers:create_image';

  static allowed = (item) =>
    Promise.resolve(this.isSnapshotReadyState(item) && !isIronicInstance(item));

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'snapshot',
        label: t('Snapshot Name'),
        type: 'input-name',
        isImage: true,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { snapshot } = values;
    const { id } = this.item;
    return this.store.createImage({ id, image: snapshot });
  };
}

export default inject('rootStore')(observer(CreateSnapshot));
