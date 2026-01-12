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
  imageFormats,
  imageStatus,
} from 'resources/glance/image';
import globalInstanceSnapshotStore from 'src/stores/glance/instance-snapshot';
import { getDiskInfo } from 'src/resources/cinder/snapshot';

export class Rebuild extends ModalAction {
  static id = 'rebuild';

  static title = t('Rebuild Instance');

  init() {
    this.store = globalServerStore;
    this.imageStore = globalImageStore;
    this.instanceSnapshotStore = globalInstanceSnapshotStore;
    this.state.source = 'image';
    this.getImages();
    this.getInstanceSnapshots();
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

  async getInstanceSnapshots() {
    await this.instanceSnapshotStore.fetchList();
  }

  get snapshots() {
    const {
      list: { data },
    } = this.instanceSnapshotStore;
    return data || [];
  }

  get sourceTypeIsSnapshot() {
    const { source } = this.state;
    return source === 'instanceSnapshot';
  }

  onSourceChange(value) {
    this.setState({ source: value });
  }

  get systemTabs() {
    return getImageSystemTabs();
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      source: 'image',
    };
    return value;
  }

  static policy = 'os_compute_api:servers:rebuild';

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

  get instanceSnapshotColumns() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Disk Format'),
        dataIndex: 'disk_format',
        valueMap: imageFormats,
      },
      {
        title: t('Min System Disk'),
        dataIndex: 'min_disk',
        unit: 'GiB',
      },
      {
        title: t('Min Memory'),
        dataIndex: 'min_ram',
        render: (text) => `${text / 1024}GiB`,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: imageStatus,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
  }

  onInstanceSnapshotChange = async (value) => {
    const { min_disk, size, id } = value.selectedRows[0] || {};
    if (!id) {
      this.setState({
        instanceSnapshotDisk: null,
        instanceSnapshotMinSize: 0,
        instanceSnapshotDataVolumes: [],
      });
      return;
    }
    const detail =
      await this.instanceSnapshotStore.fetchInstanceSnapshotVolumeData({ id });
    const {
      snapshotDetail: { size: snapshotSize = 0 } = {},
      block_device_mapping = '',
      volumeDetail,
      snapshotDetail,
      instanceSnapshotDataVolumes = [],
    } = detail;
    if (!volumeDetail) {
      this.updateFormValue('bootFromVolume', true);
      this.setState({
        instanceSnapshotDisk: null,
        instanceSnapshotMinSize: 0,
        instanceSnapshotDataVolumes: [],
        bootFromVolume: true,
      });
    }
    const minSize = Math.max(min_disk, size, snapshotSize);

    const bdmFormatData = JSON.parse(block_device_mapping) || [];
    const systemDiskBdm = bdmFormatData[0] || {};
    const instanceSnapshotDisk = getDiskInfo({
      volumeDetail,
      snapshotDetail,
      selfBdmData: systemDiskBdm,
    });
    this.updateFormValue('instanceSnapshotDisk', instanceSnapshotDisk);
    this.setState({
      instanceSnapshotDisk,
      instanceSnapshotMinSize: minSize,
      instanceSnapshotDataVolumes,
    });
  };

  get sourceTypeIsImage() {
    const { source } = this.state;
    return source === 'image';
  }

  get instanceExtra() {
    const { snapshots = [] } = this.state;
    if (!snapshots.length) {
      return '';
    }
    return t('The root disk of the instance has snapshots');
  }

  get sourceTypes() {
    const types = [
      { label: t('Image'), value: 'image' },
      {
        label: t('Instance Snapshot'),
        value: 'instanceSnapshot',
      },
    ];
    return types;
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
        name: 'source',
        label: t('Start Source'),
        type: 'radio',
        options: this.sourceTypes,
        required: true,
        tip: t(
          'The start source is a template used to create an instance. You can choose an image.'
        ),
        onChange: (value) => {
          this.onSourceChange(value);
        },
      },
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        isLoading: this.imageStore.list.isLoading,
        required: this.sourceTypeIsImage,
        display: this.sourceTypeIsImage,
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
      {
        name: 'instanceSnapshot',
        label: t('Instance Snapshot'),
        type: 'select-table',
        data: this.snapshots,
        required: this.sourceTypeIsSnapshot,
        isMulti: false,
        hidden: !this.sourceTypeIsSnapshot,
        display: this.sourceTypeIsSnapshot,
        onChange: this.onInstanceSnapshotChange,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.instanceSnapshotColumns,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      source,
      image: { selectedRowKeys: imageSelected = [] } = {},
      instanceSnapshot: { selectedRowKeys: snapshotSelected = [] } = {},
    } = values || {};
    const imageRef =
      source === 'instanceSnapshot' ? snapshotSelected[0] : imageSelected[0];
    return this.store.rebuild({ id, imageRef });
  };
}

export default inject('rootStore')(observer(Rebuild));
