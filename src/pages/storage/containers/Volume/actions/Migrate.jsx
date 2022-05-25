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
import { isAvailableOrInUse } from 'resources/cinder/volume';
import globalPoolStore from 'stores/cinder/pool';
import { poolColumns } from 'resources/cinder/cinder-pool';

export class Migrate extends ModalAction {
  static id = 'migrate-volume';

  static title = t('Migrate Volume');

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Migrate volume');
  }

  init() {
    this.poolStore = globalPoolStore;
    this.getPools();
  }

  get defaultValue() {
    const { name, id, volume_type, size, host } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
      host,
    };
    return value;
  }

  static policy = 'volume_extension:volume_admin_actions:migrate_volume';

  static allowed = (item) => Promise.resolve(isAvailableOrInUse(item));

  getPools() {
    this.poolStore.fetchList();
  }

  get pools() {
    return this.poolStore.list.data || [];
  }

  disableFunc = (record) => {
    const { host } = this.item;
    return record.name === host;
  };

  get formItems() {
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'host',
        label: t('Current Storage Backend'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'pool',
        label: t('Target Storage Backend'),
        type: 'select-table',
        required: true,
        data: this.pools,
        isLoading: this.poolStore.list.isLoading,
        disabledFunc: this.disableFunc,
        rowKey: 'name',
        columns: poolColumns,
      },
    ];
  }

  onSubmit = ({ pool }) => {
    const {
      item: { id },
    } = this;
    const { selectedRowKeys = [] } = pool || {};
    return globalVolumeStore.migrate(id, { host: selectedRowKeys[0] });
  };
}

export default inject('rootStore')(observer(Migrate));
