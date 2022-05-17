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
import globalBackupStore from 'stores/cinder/backup';
import { createTip, backupModeList, modeTip } from 'resources/cinder/backup';
import {
  isAvailableOrInUse,
  isInUse,
  volumeSelectTablePropsBackend,
} from 'resources/cinder/volume';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Backup');

  get name() {
    return t('Create Backup');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.store = globalBackupStore;
    this.volumeStore = globalVolumeStore;
  }

  get tips() {
    return createTip;
  }

  get defaultValue() {
    return {
      incremental: false,
    };
  }

  static policy = 'backup:create';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Backup Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'incremental',
        label: t('Backup Mode'),
        type: 'radio',
        options: backupModeList,
        tip: modeTip,
      },
      {
        name: 'volume',
        label: t('Volume'),
        type: 'select-table',
        backendPageStore: this.volumeStore,
        required: true,
        disabledFunc: (record) => !isAvailableOrInUse(record),
        ...volumeSelectTablePropsBackend,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      volume: { selectedRowKeys, selectedRows },
      ...rest
    } = values;
    const force = isInUse(selectedRows[0]);
    const body = {
      ...rest,
      volume_id: selectedRowKeys[0],
      force,
    };
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
