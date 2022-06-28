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
import globalProjectStore from 'stores/keystone/project';

export const getQuota = (cinderQuota) => {
  const { backups = {}, backup_gigabytes: gigabytes = {} } = cinderQuota || {};
  return {
    backups,
    gigabytes,
  };
};

export const getAdd = (cinderQuota) => {
  const { backups, gigabytes } = getQuota(cinderQuota);
  const { left = 0 } = backups || {};
  const { left: sizeLeft = 0, limit } = gigabytes || {};
  const { currentVolumeSize = 0 } = globalBackupStore;
  const add =
    left !== 0 && (limit === -1 || sizeLeft >= currentVolumeSize) ? 1 : 0;
  return {
    add,
    addSize: add === 1 ? currentVolumeSize : 0,
  };
};

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
    globalBackupStore.setCurrentVolume({});
    this.store = globalBackupStore;
    this.volumeStore = globalVolumeStore;
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.projectStore = globalProjectStore;
    this.getQuota();
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

  static get disableSubmit() {
    const { cinderQuota = {} } = globalProjectStore;
    const { add } = getAdd(cinderQuota);
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
    const { backups = {}, gigabytes = {} } = getQuota(quota);
    const { add, addSize } = getAdd(quota);
    const backupData = {
      ...backups,
      add,
      name: 'backup',
      title: t('Backup'),
    };
    const sizeData = {
      ...gigabytes,
      add: addSize,
      name: 'gigabytes',
      title: t('Backup gigabytes (GiB)'),
      type: 'line',
    };
    return [backupData, sizeData];
  }

  onVolumeChange = (value) => {
    const { selectedRows = [] } = value || {};
    const volume = selectedRows[0] || {};
    this.store.setCurrentVolume(volume);
  };

  disabledVolume = (item) => {
    if (!isAvailableOrInUse(item)) {
      return true;
    }
    const { size } = item;
    const {
      gigabytes: { left: sizeLeft = 0 } = {},
      backups: { left = 0 } = {},
    } = getQuota(this.state.quota);
    if (left === 0) {
      return true;
    }
    if (sizeLeft === -1) {
      return false;
    }
    return sizeLeft < size;
  };

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
        disabledFunc: this.disabledVolume,
        ...volumeSelectTablePropsBackend,
        onChange: this.onVolumeChange,
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
