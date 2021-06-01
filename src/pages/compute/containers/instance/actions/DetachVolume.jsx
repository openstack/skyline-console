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
import { VolumeStore } from 'stores/cinder/volume';
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { volumeStatus, isOsDisk } from 'resources/volume';
import {
  isActive,
  isNotLocked,
  isNotDeleting,
  isIronicInstance,
} from 'resources/instance';

@inject('rootStore')
@observer
export default class DetachVolume extends ModalAction {
  static id = 'detach-volume';

  static title = t('Detach Volume');

  init() {
    this.store = globalServerStore;
    this.volumeStore = new VolumeStore();
    this.getVolumes();
  }

  get name() {
    return t('Detach Volume');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get volumes() {
    return (this.volumeStore.list.data || []).filter((item) => !isOsDisk(item));
  }

  getVolumes() {
    const { id } = this.item;
    this.volumeStore.fetchList({ serverId: id });
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };
    return value;
  }

  static policy = 'os_compute_api:os-volumes-attachments:delete';

  // static hasDataVolume = item => item.volumes_attached && item.volumes_attached.length > 1

  // static allowed = item => Promise.resolve(isActive(item) && isNotDeleting(item) && isNotLocked(item) && this.hasDataVolume(item))
  static allowed = (item) =>
    Promise.resolve(
      isActive(item) &&
        isNotDeleting(item) &&
        isNotLocked(item) &&
        !isIronicInstance(item)
    );

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'volumes',
        label: t('Volume'),
        type: 'select-table',
        required: true,
        datas: this.volumes,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Size'),
            dataIndex: 'size',
            render: (value) => `${value}GB`,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            render: (value) => volumeStatus[value] || '-',
          },
          {
            title: t('Type'),
            dataIndex: 'volume_type',
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'sinceTime',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      volumes: { selectedRowKeys = [] },
    } = values;
    return this.store.detachVolume({ id, volumes: selectedRowKeys });
  };
}
