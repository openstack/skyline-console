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

import { ModalAction } from 'containers/Action';
import globalBackupStore from 'stores/cinder/backup';
import { VolumeStore } from 'stores/cinder/volume';
import { ServerGroupInstanceStore } from 'stores/skyline/server-group-instance';
import { inject, observer } from 'mobx-react';
import { restoreTip } from 'resources/cinder/backup';
import { volumeStatus } from 'resources/cinder/volume';
import { instanceStatus, isShutOff } from 'resources/nova/instance';

export class Restore extends ModalAction {
  static id = 'restore-backup';

  static title = t('Restore Backup');

  static policy = 'backup:restore';

  init() {
    this.store = globalBackupStore;
    this.volumeStore = new VolumeStore();
    this.serverStore = new ServerGroupInstanceStore();
    this.state.volume = null;
    this.state.instances = [];
    this.state.enable = false;
    this.getVolume();
  }

  get name() {
    return t('Restore backup');
  }

  get tips() {
    return restoreTip;
  }

  get volumeName() {
    const { volume_name, volume_id } = this.item;
    const volume = this.volumeStore.detail || {};
    const { status } = volume || {};
    const volumeStatusText = volumeStatus[status] || status || '-';
    return `${volume_name || volume_id}(${t('Status')}: ${volumeStatusText})`;
  }

  get instanceNames() {
    const instances = this.serverStore.list.data || [];
    const names = instances.map((it) => {
      const { status, name } = it;
      const instanceStatusText = instanceStatus[status] || status || '-';
      return `${name}(${t('Status')}: ${instanceStatusText})`;
    });
    return names.join(' | ');
  }

  get defaultValue() {
    return {
      volumeName: this.volumeName,
      instanceNames: this.instanceNames,
    };
  }

  static allowed = () => Promise.resolve(true);

  async getVolume() {
    let enable = false;
    const { volume_id } = this.item;
    const volume = await this.volumeStore.fetchDetail({ id: volume_id });
    const { status } = volume;
    if (status === 'available') {
      enable = true;
    } else if (status === 'in-use') {
      const params = {
        members: volume.attachments.map((it) => it.server_id),
        isServerGroup: true,
      };
      const instances = await this.serverStore.fetchList(params);
      enable = instances.every((it) => isShutOff(it));
    }
    this.setState({
      enable,
    });
    this.updateDefaultValue();
  }

  checkVolume = () => {
    const volume = this.volumeStore.detail || {};
    const { status } = volume || {};
    if (status === 'available' || status === 'in-use') {
      return Promise.resolve();
    }
    return Promise.reject(
      t(
        'The volume associated with the backup is not available, unable to restore.'
      )
    );
  };

  checkInstance = () => {
    const instances = this.serverStore.list.data || {};
    const enable = instances.every((it) => isShutOff(it));
    if (enable) {
      return Promise.resolve();
    }
    return Promise.reject(
      t('The instance is not shut down, unable to restore.')
    );
  };

  get formItems() {
    const items = [
      {
        name: 'volumeName',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
        validator: this.checkVolume,
      },
    ];
    if (this.instanceNames) {
      items.push({
        name: 'instanceNames',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
        validator: this.checkInstance,
      });
    }
    return items;
  }

  onSubmit = () => {
    const { enable } = this.state;
    if (!enable) {
      return Promise.reject();
    }
    const { volume_id, id } = this.item;
    const body = {
      volume_id,
    };
    return globalBackupStore.restore(id, body);
  };
}

export default inject('rootStore')(observer(Restore));
