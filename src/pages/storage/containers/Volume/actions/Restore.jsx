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
import { VolumeStore } from 'stores/cinder/volume';
import globalSnapshotStore from 'stores/cinder/snapshot';
import { volumeStatus } from 'resources/cinder/volume';
import { getSinceTime } from 'utils/time';

export class RestoreAction extends ModalAction {
  static id = 'Restore from snapshot';

  static title = t('Restore From Snapshot');

  init() {
    this.store = new VolumeStore();
    this.snapshotStore = globalSnapshotStore;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get defaultValue() {
    const { name, id = '-', volume_type = '-', size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
    };
    return value;
  }

  get formItems() {
    const { id } = this.item;
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'snapshot',
        label: t('Select Volume Snapshot'),
        type: 'select-table',
        backendPageStore: this.snapshotStore,
        extraParams: { volume_id: id },
        required: true,
        isMulti: false,
        isSortByBack: true,
        defaultSortKey: 'created_at',
        defaultSortOrder: 'descend',
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
            unit: 'GiB',
            sorter: false,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            valueMap: volumeStatus,
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            render: (time) => getSinceTime(time),
          },
        ],
      },
    ];
  }

  get name() {
    return t('Restore from snapshot');
  }

  static policy = 'volume:create';

  static allowed = (item) => {
    return Promise.resolve(item.status === 'available');
  };

  onSubmit = (values) => {
    const { snapshot: { selectedRowKeys = [] } = {} } = values;
    const { id } = this.item;
    return this.store.revert(id, { snapshot_id: selectedRowKeys[0] });
  };
}

export default inject('rootStore')(observer(RestoreAction));
