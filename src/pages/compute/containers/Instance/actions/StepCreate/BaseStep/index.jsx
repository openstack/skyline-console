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
import { Row, Col } from 'antd';
import { volumeStatus, canCreateInstance } from 'resources/cinder/volume';
import globalServerStore from 'stores/nova/instance';
import globalImageStore from 'stores/glance/image';
import globalInstanceSnapshotStore from 'stores/glance/instance-snapshot';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import { VolumeStore } from 'stores/cinder/volume';
import {
  canImageCreateInstance,
  getImageSystemTabs,
  getImageOS,
  getImageColumns,
  imageFormats,
  imageStatus,
} from 'resources/glance/image';
import Base from 'components/Form';
import InstanceVolume from 'components/FormItem/InstanceVolume';
import { isGpuCategory } from 'resources/nova/flavor';
import {
  volumeTypes,
  getDiskInfo,
  getInstanceSnapshotDataDisk,
} from 'resources/cinder/snapshot';
import FlavorSelectTable from '../../../components/FlavorSelectTable';

export class BaseStep extends Base {
  init() {
    this.serverStore = globalServerStore;
    this.imageStore = globalImageStore;
    this.volumeStore = new VolumeStore();
    this.volumeTypeStore = globalVolumeTypeStore;
    this.instanceSnapshotStore = globalInstanceSnapshotStore;
    this.getAvailZones();
    this.getImages();
    this.getVolumeTypes();
    this.getVolumes();
    this.getInstanceSnapshots();
    this.initSourceChange();
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
    const { volume, snapshot } = this.locationParams;
    let source = this.imageSourceType;
    if (volume) {
      source = this.volumeSourceType;
    } else if (snapshot) {
      source = this.snapshotSourceType;
    }
    const values = {
      systemDisk: this.defaultVolumeType,
      source,
      project: this.currentProjectName,
      dataDisk: [],
    };
    if (source.value === 'image') {
      values.bootFromVolume = true;
    }
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
    const data = image
      ? [toJS(this.imageStore.detail)]
      : this.imageStore.list.data || [];
    const images = data.filter((it) => {
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

  get snapshots() {
    const { snapshot } = this.locationParams;
    if (!snapshot) {
      const {
        list: { data },
      } = this.instanceSnapshotStore;
      return data || [];
    }
    return [toJS(this.instanceSnapshotStore.detail)];
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get volumeTypes() {
    return volumeTypes();
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
      deleteType: 0,
    };
    return data;
  }

  get sourceTypes() {
    const { image, snapshot, volume } = this.locationParams;
    const types = [
      { label: t('Image'), value: 'image', disabled: volume || snapshot },
      {
        label: t('Instance Snapshot'),
        value: 'instanceSnapshot',
        disabled: image || volume,
      },
    ];
    if (this.enableCinder) {
      types.push({
        label: t('Bootable Volume'),
        value: 'bootableVolume',
        disabled: image || snapshot,
      });
    }
    return types;
  }

  get imageSourceType() {
    return this.sourceTypes.find((it) => it.value === 'image');
  }

  get snapshotSourceType() {
    return this.sourceTypes.find((it) => it.value === 'instanceSnapshot');
  }

  get volumeSourceType() {
    return this.enableCinder
      ? this.sourceTypes.find((it) => it.value === 'bootableVolume')
      : {};
  }

  allowed = () => Promise.resolve();

  async getAvailZones() {
    await globalAvailabilityZoneStore.fetchListWithoutDetail();
    if (this.availableZones.length) {
      this.updateFormValue('availableZone', this.availableZones[0]);
    }
  }

  async getImages() {
    const { volume, image, snapshot } = this.locationParams;
    if (volume || snapshot) {
      return;
    }
    if (image) {
      await this.imageStore.fetchDetail({ id: image });
    } else {
      await this.imageStore.fetchList({ all_projects: this.hasAdminRole });
    }
  }

  async getVolumeTypes() {
    if (this.enableCinder) {
      await this.volumeTypeStore.fetchList();
    }
  }

  async getVolumes() {
    const { image, snapshot, volume } = this.locationParams;
    if (image || snapshot) {
      return;
    }
    if (!this.enableCinder) {
      return;
    }
    if (volume) {
      await this.volumeStore.fetchDetail({
        id: volume,
      });
      this.updateContext({
        source: this.volumeSourceType,
      });
    } else {
      await this.volumeStore.fetchList({
        sortKey: 'bootable',
        sortOrder: 'ascend',
      });
    }
  }

  async getInstanceSnapshots() {
    const { image, snapshot, volume } = this.locationParams;
    if (image || volume) {
      return;
    }
    if (!snapshot) {
      this.instanceSnapshotStore.fetchList();
      return;
    }
    await this.instanceSnapshotStore.fetchDetail({ id: snapshot });
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get systemTabs() {
    return getImageSystemTabs();
  }

  checkSystemDisk = (rule, value) => {
    const { size = 10, type } = value || {};
    const minSize = this.getSystemDiskMinSize();
    if (!type) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('');
    }
    if (!size) {
      return Promise.reject(new Error(t('Please set the system disk size!')));
    }
    if (size < minSize) {
      return Promise.reject(
        new Error(
          t('Please set a size no less than {minSize} GiB!', { minSize })
        )
      );
    }
    return Promise.resolve();
  };

  get nameForStateUpdate() {
    return [
      'source',
      'image',
      'instanceSnapshot',
      'bootableVolume',
      'flavor',
      'bootFromVolume',
    ];
  }

  getSystemDiskMinSize() {
    const flavorSize = this.state.flavor?.disk || 0;

    if (this.sourceTypeIsImage) {
      const { min_disk = 0, size = 0 } = this.state.image || {};
      const sizeGiB = Math.ceil(size / 1024 / 1024 / 1024);
      const imageSize = Math.max(min_disk, sizeGiB, 1);
      return Math.max(flavorSize, imageSize, 1);
    }

    if (this.sourceTypeIsSnapshot) {
      const { instanceSnapshotMinSize = 0 } = this.state;
      return Math.max(instanceSnapshotMinSize, 1);
    }

    return Math.max(flavorSize, 1);
  }

  get sourceTypeIsImage() {
    const { source } = this.state;
    return source === this.imageSourceType.value;
  }

  get sourceTypeIsSnapshot() {
    const { source } = this.state;
    return source === this.snapshotSourceType.value;
  }

  get sourceTypeIsVolume() {
    const { source } = this.state;
    return source === this.volumeSourceType.value;
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

  initSourceChange() {
    const { snapshot, volume } = this.locationParams;
    if (snapshot) {
      this.onSourceChange(this.snapshotSourceType);
    } else if (volume) {
      this.onSourceChange(this.volumeSourceType);
    } else {
      this.onSourceChange(this.imageSourceType);
    }
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  onChangeBootFromVolume = (value) => {
    const newData = {
      bootFromVolume: value,
    };
    if (!value) {
      newData.dataDisk = [];
      this.updateFormValue('dataDisk', []);
    }
    this.updateContext(newData);
  };

  onInstanceSnapshotChange = async (value) => {
    const { size, id } = value.selectedRows[0] || {};
    if (!id) {
      this.updateContext({
        instanceSnapshotDisk: null,
        instanceSnapshotDataVolumes: [],
      });
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
      block_device_mapping = '',
      volumeDetail,
      snapshotDetail,
      instanceSnapshotDataVolumes = [],
    } = detail;
    if (!volumeDetail) {
      this.updateFormValue('bootFromVolume', true);
      this.updateContext({
        instanceSnapshotDisk: null,
        instanceSnapshotDataVolumes: [],
        bootFromVolume: true,
      });
      this.setState({
        instanceSnapshotDisk: null,
        instanceSnapshotMinSize: 0,
        instanceSnapshotDataVolumes: [],
        bootFromVolume: true,
      });
    }

    const bdmFormatData = JSON.parse(block_device_mapping) || [];
    const systemDiskBdm = bdmFormatData[0] || {};
    const instanceSnapshotDisk = getDiskInfo({
      volumeDetail,
      snapshotDetail,
      selfBdmData: systemDiskBdm,
    });
    this.updateFormValue('instanceSnapshotDisk', instanceSnapshotDisk);
    this.updateContext({
      instanceSnapshotDisk,
      instanceSnapshotDataVolumes,
    });
    this.setState({
      instanceSnapshotDisk,
      instanceSnapshotMinSize: size,
      instanceSnapshotDataVolumes,
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

  onSourceChange(value) {
    this.updateContext({
      source: value,
    });
  }

  onDataDiskChange = (value) => {
    this.updateContext({
      dataDisk: value,
    });
  };

  getInstanceSnapshotDisk = () => {
    const { instanceSnapshotDisk } = this.state;
    const { instanceSnapshotDisk: oldDisk } = this.props.context;
    return instanceSnapshotDisk || oldDisk;
  };

  getSnapshotDataDisks = () => {
    const { instanceSnapshotDataVolumes } = this.state;
    const { instanceSnapshotDataVolumes: oldSnapshotDataVolumes } =
      this.props.context;
    return instanceSnapshotDataVolumes || oldSnapshotDataVolumes || [];
  };

  renderInstanceSnapshotDisk = (disk) => {
    if (disk === null) {
      return null;
    }
    const { deleteTypeLabel, typeOption = {}, size } = disk || {};
    if (!size) {
      return null;
    }
    const style = {
      marginRight: 10,
      maxWidth: '20%',
    };
    return (
      <Row gutter={24}>
        <Col span={8}>
          <span style={style}>{t('Type')}</span>
          {typeOption.label}
        </Col>
        <Col span={8}>
          <span style={style}>{t('Size')}</span>
          {size}
          <span style={style}>GiB</span>
        </Col>
        <Col span={8}>{deleteTypeLabel}</Col>
      </Row>
    );
  };

  renderSnapshotDisk = () => {
    const disk = this.getInstanceSnapshotDisk();
    return this.renderInstanceSnapshotDisk(disk);
  };

  renderSnapshotDataDisk = () => {
    const dataDisks = this.getSnapshotDataDisks();
    return (
      <>
        {dataDisks?.map((i) => {
          const disk = getInstanceSnapshotDataDisk(i);
          const id = i?.id || i?.snapshot_id;
          return (
            <div style={{ marginBottom: 10 }} key={`data-disk-${id}`}>
              {this.renderInstanceSnapshotDisk(disk)}
            </div>
          );
        })}
      </>
    );
  };

  get imageColumns() {
    return getImageColumns(this);
  }

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

  get volumeColumns() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        unit: 'GiB',
        width: 80,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: volumeStatus,
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
    ];
  }

  get supportNoBootFromVolume() {
    return true;
  }

  get showBootFromVolumeFormItem() {
    if (!this.supportNoBootFromVolume) {
      return false;
    }
    if (!this.enableCinder) {
      return false;
    }
    if (this.sourceTypeIsImage) {
      return true;
    }
    return this.showSystemDisk;
  }

  get bootFromVolumeOptions() {
    return [
      {
        value: true,
        label: t('Yes - Create a new system disk'),
      },
      {
        value: false,
        label: t('No - Do not create a new system disk'),
      },
    ];
  }

  get showSystemDisk() {
    const snapshotDisk = this.getInstanceSnapshotDisk();
    return (
      this.enableCinder &&
      (this.sourceTypeIsImage ||
        (this.sourceTypeIsSnapshot && snapshotDisk === null))
    );
  }

  get showSystemDiskByBootFromVolume() {
    if (!this.showSystemDisk) {
      return false;
    }
    if (!this.supportNoBootFromVolume) {
      return true;
    }
    // support non-bfv and bootFromVolume = true
    const { bootFromVolume = true } = this.state;
    return !!bootFromVolume;
  }

  get hideInstanceSnapshotSystemDisk() {
    return this.showSystemDisk || this.sourceTypeIsVolume;
  }

  get hideInstanceSnapshotDataDisk() {
    if (this.hideInstanceSnapshotSystemDisk) return true;
    return this.getSnapshotDataDisks().length === 0;
  }

  get hideDataDisk() {
    if (!this.supportNoBootFromVolume) {
      return false;
    }
    if (this.sourceTypeIsVolume) {
      return false;
    }
    const { bootFromVolume = true } = this.state;
    return !bootFromVolume;
  }

  getFlavorComponent() {
    return <FlavorSelectTable onChange={this.onFlavorChange} />;
  }

  getSystemDiskMinSizeText() {
    const minSize = this.getSystemDiskMinSize();
    const minSizeLabel = t('Min size');
    const note = t(
      'Disk size is limited by the min disk of flavor, image, etc.'
    );

    if (!minSize || minSize <= 0) {
      return `${minSizeLabel}: - GiB. ${note}`;
    }

    return `${minSizeLabel}: ${minSize} GiB. ${note}`;
  }

  get formItems() {
    const { image } = this.locationParams;
    const imageLoading = image
      ? this.imageStore.isLoading
      : this.imageStore.list.isLoading;
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
        type: 'select-table',
        component: this.getFlavorComponent(),
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
        onChange: (value) => {
          this.onSourceChange(value);
        },
      },
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        isLoading: imageLoading,
        required: this.sourceTypeIsImage,
        isMulti: false,
        display: this.sourceTypeIsImage,
        extra: this.getImageExtraWords(),
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.imageColumns,
        tabs: this.systemTabs,
        defaultTabValue:
          this.locationParams.os_distro || this.systemTabs[0].value,
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
      {
        name: 'bootableVolume',
        label: t('Bootable Volume'),
        type: 'select-table',
        data: this.volumes,
        isLoading: this.volumeStore.list.isLoading,
        required: this.sourceTypeIsVolume,
        isMulti: false,
        display: this.sourceTypeIsVolume && this.enableCinder,
        onChange: this.onBootableVolumeChange,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.volumeColumns,
      },
      {
        type: 'divider',
      },
      {
        name: 'bootFromVolume',
        label: t('Boot From Volume'),
        type: 'radio',
        required: this.showBootFromVolumeFormItem,
        hidden: !this.showBootFromVolumeFormItem,
        onChange: this.onChangeBootFromVolume,
        wrapperCol: {
          xs: {
            span: 16,
          },
          sm: {
            span: 14,
          },
        },
        options: this.bootFromVolumeOptions,
      },
      {
        name: 'systemDisk',
        label: t('System Disk'),
        type: 'instance-volume',
        options: this.volumeTypes,
        defaultOptionValue: this.volumeTypeStore.list?.isLoading
          ? undefined
          : this.volumeTypes.find(
              (option) => option.label?.toLowerCase() === 'cubestorage'
            )?.value,
        required: this.showSystemDiskByBootFromVolume,
        hidden: !this.showSystemDiskByBootFromVolume,
        validator: this.checkSystemDisk,
        minSize: this.getSystemDiskMinSize(),
        extra: this.getSystemDiskMinSizeText(),
        onChange: this.onSystemDiskChange,
        dependencies: ['flavor', 'image', 'instanceSnapshot', 'bootFromVolume'],
        value: this.getSystemDiskMinSize(),
      },
      {
        name: 'deleteVolumeInstance',
        label: t('Delete Volume on Instance Delete'),
        type: 'check',
        hidden: !this.sourceTypeIsVolume,
      },
      {
        name: 'instanceSnapshotDisk',
        label: t('System Disk'),
        hidden: this.hideInstanceSnapshotSystemDisk,
        component: this.renderSnapshotDisk(),
      },
      {
        name: 'instanceSnapshotDataDisk',
        label: t('Required Data Disk'),
        hidden: this.hideInstanceSnapshotDataDisk,
        component: this.renderSnapshotDataDisk(),
      },
      {
        name: 'dataDisk',
        label: t('Data Disk'),
        type: 'add-select',
        options: this.volumeTypes,
        defaultItemValue: this.defaultVolumeType,
        hidden: this.hideDataDisk,
        itemComponent: InstanceVolume,
        minCount: 0,
        addTextTips: t('Data Disks'),
        addText: t('Add Data Disks'),
        extra: t(
          'Too many disks mounted on the instance will affect the read and write performance. It is recommended not to exceed 16 disks.'
        ),
        onChange: this.onDataDiskChange,
        display: this.enableCinder,
      },
    ];
  }
}

export default inject('rootStore')(observer(BaseStep));
