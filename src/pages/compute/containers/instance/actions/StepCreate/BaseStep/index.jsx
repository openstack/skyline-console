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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { volumeStatus, canCreateInstance } from 'resources/volume';
import globalServerStore from 'stores/nova/instance';
import globalImageStore from 'stores/glance/image';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import { VolumeStore } from 'stores/cinder/volume';
import {
  canImageCreateInstance,
  getImageSystemTabs,
  getImageOS,
  getImageColumns,
} from 'resources/image';
import Base from 'components/Form';
import InstanceVolume from 'components/FormItem/InstanceVolume';
import { isGpuCategory } from 'resources/flavor';
import FlavorSelectTable from '../../../components/FlavorSelectTable';

@inject('rootStore')
@observer
export default class BaseStep extends Base {
  init() {
    this.serverStore = globalServerStore;
    this.imageStore = globalImageStore;
    this.volumeStore = new VolumeStore();
    this.volumeTypeStore = globalVolumeTypeStore;
    this.getAvailZones();
    this.getImages();
    this.getVolumeTypes();
    this.getVolumes();
  }

  get title() {
    return 'BaseStep';
  }

  get name() {
    return 'BaseStep';
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    const { volume } = this.locationParams;
    let source = this.sourceTypes[0];
    if (volume) {
      source = this.sourceTypes[1];
    }
    const values = {
      systemDisk: this.defaultVolumeType,
      source,
      project: this.currentProjectName,
      dataDisk: [],
    };
    return values;
  }

  get availableZones() {
    return (globalAvailabilityZoneStore.list.data || [])
      .filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
      }));
  }

  get images() {
    const { imageTab } = this.state;
    const { image } = this.locationParams;
    const datas = image
      ? [toJS(this.imageStore.detail)]
      : this.imageStore.list.data || [];
    const images = datas.filter((it) => {
      if (!canImageCreateInstance(it)) {
        return false;
      }
      if (imageTab) {
        return getImageOS(it) === imageTab;
      }
      return it;
    });
    return images.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get volumeTypes() {
    return (this.volumeTypeStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
      originData: toJS(it),
    }));
  }

  get volumes() {
    const { volume } = this.locationParams;
    if (volume) {
      return [toJS(this.volumeStore.detail)].filter((it) =>
        canCreateInstance(it)
      );
    }
    return (this.volumeStore.list.data || [])
      .filter((it) => canCreateInstance(it))
      .map((it) => ({
        ...it,
        key: it.id,
      }));
  }

  get defaultVolumeType() {
    const data = {
      size: 10,
      deleteType: 1,
    };
    return data;
  }

  get sourceTypes() {
    const { image, volume } = this.locationParams;
    return [
      { label: t('Image'), value: 'image', disabled: volume },
      {
        label: t('Bootable Volume'),
        value: 'bootableVolume',
        disabled: image,
      },
    ];
  }

  allowed = () => Promise.resolve();

  async getAvailZones() {
    await globalAvailabilityZoneStore.fetchListWithoutDetail();
    if (this.availableZones.length) {
      this.updateFormValue('availableZone', this.availableZones[0]);
    }
  }

  async getImages() {
    const { volume, image } = this.locationParams;
    if (volume) {
      return;
    }
    if (image) {
      await this.imageStore.fetchDetail({ id: image });
    } else {
      await this.imageStore.fetchList({ all_projects: this.hasAdminRole });
    }
    if (image) {
      this.updateFormValue('image', {
        selectedRowKeys: [image],
        selectedRows: this.images.filter((it) => it.id === image),
      });
    }
  }

  async getVolumeTypes() {
    await this.volumeTypeStore.fetchList();
  }

  async getVolumes() {
    const { image, volume } = this.locationParams;
    if (image) {
      return;
    }
    if (volume) {
      await this.volumeStore.fetchDetail({
        id: volume,
      });
      this.updateContext({
        source: this.sourceTypes[1],
      });
    } else {
      await this.volumeStore.fetchList({
        sortKey: 'bootable',
        sortDir: 'ascend',
      });
    }
    if (volume) {
      this.updateFormValue('volume', {
        selectedRowKeys: [volume],
        selectedRows: this.volumes.filter((it) => it.id === volume),
      });
    }
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get systemTabs() {
    return getImageSystemTabs();
  }

  get specTabs() {
    return [
      {
        label: t('General Computing Type'),
        // value: 'general'
        value: 1,
      },
      {
        label: t('Optimized Computing Type'),
        // value: 'computing'
        value: 5,
      },
      {
        label: t('GPU Accelerated Computing Type'),
        // value: 'gpu'
        value: 10,
      },
    ];
  }

  checkSystemDisk = (rule, value) => {
    if (!value.type) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('');
    }
    return Promise.resolve();
  };

  get nameForStateUpdate() {
    return ['source', 'image', 'bootableVolume', 'flavor'];
  }

  getSystemDiskMinSize() {
    const flavorSize = (this.state.flavor || {}).disk || 0;
    let imageSize = 0;
    if (this.sourceTypeIsImage) {
      const { min_disk = 0, size = 0 } = this.state.image || {};
      const sizeGB = Math.ceil(size / 1024 / 1024 / 1024);
      imageSize = Math.max(min_disk, sizeGB, 1);
    }
    return Math.max(flavorSize, imageSize, 1);
  }

  get sourceTypeIsImage() {
    const { source } = this.state;
    return source === this.sourceTypes[0].value;
  }

  get sourceTypeIsVolume() {
    const { source } = this.state;
    return source === this.sourceTypes[1].value;
  }

  getImageExtraWords() {
    const { flavor: { category } = {} } = this.state;
    if (isGpuCategory(category)) {
      return t(
        'For GPU type, you need to install GPU drivers in the instance operating system.'
      );
    }
    return '';
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  onBootableVolumeChange = (value) => {
    this.updateContext({
      bootableVolume: value,
    });
  };

  onSystemDiskChange = (value) => {
    this.updateContext({
      systemDisk: value,
    });
  };

  onSourceChange = (value) => {
    this.updateContext({
      source: value,
    });
  };

  onDataDiskChange = (value) => {
    this.updateContext({
      dataDisk: value,
    });
  };

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        name: 'availableZone',
        label: t('Available Zone'),
        type: 'select',
        placeholder: t('Please select'),
        isWrappedValue: true,
        required: true,
        options: this.availableZones,
        tip: t(
          'Availability zone refers to a physical area where power and network are independent of each other in the same area. In the same region, the availability zone and the availability zone can communicate with each other in the intranet, and the available zones can achieve fault isolation.'
        ),
      },
      {
        type: 'divider',
      },
      {
        name: 'flavor',
        label: t('Specification'),
        component: <FlavorSelectTable onChange={this.onFlavorChange} />,
        required: true,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      },
      {
        name: 'source',
        label: t('Start Source'),
        type: 'radio',
        options: this.sourceTypes,
        required: true,
        isWrappedValue: true,
        tip: t(
          'The start source is a template used to create an instance. You can choose an image or a bootable volume.'
        ),
        onChange: this.onSourceChange,
      },
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        datas: this.images,
        required: this.sourceTypeIsImage,
        isMulti: false,
        hidden: !this.sourceTypeIsImage,
        extra: this.getImageExtraWords(),
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getImageColumns(this),
        tabs: this.systemTabs,
        defaultTabValue:
          this.locationParams.os_distro || this.systemTabs[0].value,
        selectedLabel: t('Image'),
        onTabChange: this.onImageTabChange,
      },
      {
        name: 'bootableVolume',
        label: t('Bootable Volume'),
        type: 'select-table',
        datas: this.volumes,
        required: this.sourceTypeIsVolume,
        isMulti: false,
        hidden: !this.sourceTypeIsVolume,
        onChange: this.onBootableVolumeChange,
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
            width: 80,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            render: (value) => volumeStatus[value] || '-',
            width: 80,
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
      {
        type: 'divider',
      },
      {
        name: 'systemDisk',
        label: t('System Disk'),
        type: 'instance-volume',
        options: this.volumeTypes,
        required: !this.sourceTypeIsVolume,
        hidden: this.sourceTypeIsVolume,
        validator: this.checkSystemDisk,
        minSize: this.getSystemDiskMinSize(),
        extra: t('Disk size is limited by the min disk of flavor, image, etc.'),
        onChange: this.onSystemDiskChange,
      },
      {
        name: 'dataDisk',
        label: t('Data Disk'),
        type: 'add-select',
        options: this.volumeTypes,
        defaultItemValue: this.defaultVolumeType,
        itemComponent: InstanceVolume,
        minCount: 0,
        addTextTips: t('Data Disks'),
        addText: t('Add Data Disks'),
        extra: t(
          'Too many disks mounted on the instance will affect the read and write performance. It is recommended not to exceed 16 disks.'
        ),
        onChange: this.onDataDiskChange,
      },
    ];
  }
}
