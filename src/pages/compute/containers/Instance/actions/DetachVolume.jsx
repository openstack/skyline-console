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
import globalRootStore from 'stores/root';
import { ModalAction } from 'containers/Action';
import { volumeStatus, isOsDisk } from 'resources/cinder/volume';
import { allowAttachVolumeInstance } from 'resources/nova/instance';

export class DetachVolume extends ModalAction {
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

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      globalRootStore.checkEndpoint('cinder') &&
        !isAdminPage &&
        allowAttachVolumeInstance(item)
    );
  };

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
        data: this.volumes,
        isLoading: this.volumeStore.list.isLoading,
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
            render: (value) => `${value}GiB`,
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

export default inject('rootStore')(observer(DetachVolume));
