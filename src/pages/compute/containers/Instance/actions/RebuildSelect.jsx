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
import globalImageStore from 'stores/glance/image';
import globalServerStore from 'stores/nova/instance';
import { InstanceVolumeStore } from 'stores/nova/instance-volume';
import { SnapshotStore } from 'stores/cinder/snapshot';
import { ModalAction } from 'containers/Action';
import {
  isActiveOrShutOff,
  isNotLocked,
  isIsoInstance,
} from 'resources/nova/instance';
import {
  getImageOS,
  getImageColumns,
  canImageCreateInstance,
  getImageSystemTabs,
} from 'resources/glance/image';
import { isOsDisk } from 'resources/cinder/volume';

export class Rebuild extends ModalAction {
  static id = 'rebuild';

  static title = t('Rebuild Instance');

  init() {
    this.store = globalServerStore;
    this.imageStore = globalImageStore;
    this.instanceVolumeStore = new InstanceVolumeStore();
    this.snapshotStore = new SnapshotStore();
    this.getImages();
    this.getRootVolumeSnapshots();
  }

  get name() {
    return t('rebuild instance');
  }

  static get modalSize() {
    return 'large';
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 4 },
    };
  }

  get tips() {
    return t(
      'If the root disk has a snapshot, it will affect the deletion of the original disk during reconstruction or the recovery of the instance snapshot.'
    );
  }

  get images() {
    const { imageTab } = this.state;
    const images = (this.imageStore.list.data || []).filter((it) => {
      if (!canImageCreateInstance(it)) {
        return false;
      }
      if (imageTab) {
        return getImageOS(it) === imageTab;
      }
      return true;
    });
    return images.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  getImages() {
    this.imageStore.fetchList({ all_projects: this.hasAdminRole });
  }

  async getRootVolumeSnapshots() {
    const volumes = await this.instanceVolumeStore.fetchList({
      serverId: this.item.id,
    });
    const rootDisk = volumes.find((v) => isOsDisk(v));
    if (!rootDisk) {
      return;
    }
    const snapshots = await this.snapshotStore.fetchList({ id: rootDisk.id });
    this.setState({ snapshots });
  }

  get systemTabs() {
    return getImageSystemTabs();
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };
    return value;
  }

  static policy = 'os_compute_api:servers:rebuild';

  // todo:
  static isRootVolumeInUse = () => true;

  static allowed = (item) => {
    const result =
      isActiveOrShutOff(item) &&
      isNotLocked(item) &&
      this.isRootVolumeInUse(item) &&
      !isIsoInstance(item);
    return Promise.resolve(result);
  };

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get instanceExtra() {
    const { snapshots = [] } = this.state;
    if (!snapshots.length) {
      return '';
    }
    return t('The root disk of the instance has snapshots');
  }

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
        extra: this.instanceExtra,
      },
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        isLoading: this.imageStore.list.isLoading,
        required: true,
        isMulti: false,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getImageColumns(this),
        tabs: this.systemTabs,
        defaultTabValue: this.systemTabs[0].value,
        selectedLabel: t('Image'),
        onTabChange: this.onImageTabChange,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      image: { selectedRowKeys = [] },
    } = values;
    return this.store.rebuild({ id, image: selectedRowKeys[0] });
  };
}

export default inject('rootStore')(observer(Rebuild));
