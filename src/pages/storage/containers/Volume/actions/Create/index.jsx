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
import Confirm from 'components/Confirm';
import { getSinceTime } from 'utils/time';
import {
  volumeStatus,
  multiTip,
  snapshotTypeTip,
  getQuotaInfo,
  getAdd,
  fetchQuota,
  getQuota,
  onVolumeSizeChange,
  setCreateVolumeCount,
  setCreateVolumeSize,
  setCreateVolumeType,
} from 'resources/cinder/volume';
import globalSnapshotStore from 'stores/cinder/snapshot';
import globalImageStore from 'stores/glance/image';
import globalVolumeStore from 'stores/cinder/volume';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalProjectStore from 'stores/keystone/project';
import globalBackupStore from 'stores/cinder/backup';
import { InputNumber, message as $message } from 'antd';
import { toJS } from 'mobx';
import { FormAction } from 'containers/Action';
import classnames from 'classnames';
import {
  getImageSystemTabs,
  getImageOS,
  getImageColumns,
  canImageCreateIronicInstance,
  canImageCreateInstance,
} from 'resources/glance/image';
import { volumeTypeSelectProps } from 'resources/cinder/volume-type';
import { allSettled } from 'utils';
import styles from './index.less';

export class Create extends FormAction {
  init() {
    this.state = {
      ...this.state,
      quotaLoading: true,
      count: 1,
      sharedDisabled: false,
      confirmCount: 0,
    };
    this.message = '';
    this.snapshotStore = globalSnapshotStore;
    this.imageStore = globalImageStore;
    this.volumeStore = globalVolumeStore;
    this.volumeTypeStore = globalVolumeTypeStore;
    this.backupStore = globalBackupStore;
    this.getQuota();
    this.getAvailZones();
    this.getImages();
    this.getVolumeTypes();
  }

  static id = 'volume-create';

  static title = t('Create Volume');

  static path = '/storage/volume/create';

  get listUrl() {
    return this.getRoutePath('volume');
  }

  get name() {
    return t('create volume');
  }

  static policy = 'volume:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get disableSubmit() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return true;
    }
    const { cinderQuota = {} } = globalProjectStore;
    const { add, error } = getAdd(cinderQuota);
    const disable = add === 0;
    if (!disable) {
      this.message = '';
    } else if (error !== this.message) {
      $message.error(error);
      this.message = error;
    }
    return disable;
  }

  get instanceName() {
    const { name } = this.values || {};
    const { count = 1 } = this.state;
    if (count === 1) {
      return name;
    }
    return new Array(count)
      .fill(count)
      .map((_, index) => `${name}-${index + 1}`)
      .join(', ');
  }

  get errorText() {
    if (this.message) {
      return t(
        'Unable to create volume: insufficient quota to create resources.'
      );
    }
    return super.errorText;
  }

  get showQuota() {
    return true;
  }

  getVolumeQuota() {
    const { quota = {} } = this.state;
    return getQuota(quota);
  }

  get quotaInfo() {
    return getQuotaInfo(this);
  }

  get defaultSize() {
    return this.quotaIsLimit && this.maxSize < 10 ? this.maxSize : 10;
  }

  get defaultValue() {
    const { initVolumeType } = this.state;
    const values = {
      source: this.sourceTypes[0],
      size: this.defaultSize,
      project: this.currentProjectName,
      availableZone: (this.availableZones[0] || []).value,
      volume_type: initVolumeType,
    };
    return values;
  }

  get availableZones() {
    const availableZonesList = [{ label: t('Not select'), value: 'noSelect' }];
    (this.volumeStore.availabilityZones || [])
      .filter((it) => it.zoneState.available)
      .forEach((it) => {
        availableZonesList.push({
          value: it.zoneName,
          label: it.zoneName,
        });
      });
    return availableZonesList;
  }

  get images() {
    const { imageTab } = this.state;
    const images = (this.imageStore.list.data || []).filter((it) => {
      if (!canImageCreateInstance(it) && !canImageCreateIronicInstance(it)) {
        return false;
      }
      if (imageTab) {
        return getImageOS(it) === imageTab && it.status === 'active';
      }
      return it;
    });
    return images.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get volumeTypes() {
    return toJS(this.volumeTypeStore.list.data || []);
  }

  get backups() {
    return (this.backupStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get sourceTypes() {
    return [
      { label: t('Blank Volume'), value: 'blank-volume' },
      { label: t('Image'), value: 'image' },
      { label: t('Volume Snapshot'), value: 'snapshot' },
      // { label: t('Backup'), value: 'backup' },
    ];
  }

  get quotaIsLimit() {
    const { gigabytes: { limit } = {} } = this.getVolumeQuota();
    return limit !== -1;
  }

  get maxSize() {
    const { gigabytes: { left = 0 } = {} } = this.getVolumeQuota();
    return left === -1 ? 1000 : left;
  }

  getAvailZones() {
    this.volumeStore.fetchAvailabilityZoneList();
  }

  getImages() {
    this.imageStore.fetchList({ all_projects: this.hasAdminRole });
  }

  async getVolumeTypes() {
    const types = await this.volumeTypeStore.fetchList({ showQoS: true });
    if (types.length > 0) {
      const defaultType = types[0];
      const { id, name } = defaultType;
      const initVolumeType = {
        selectedRowKeys: [id],
        selectedRows: [defaultType],
      };
      setCreateVolumeType(name);
      this.setState(
        {
          initVolumeType,
          volume_type: defaultType,
        },
        () => {
          this.updateFormValue('volume_type', initVolumeType);
          this.updateDefaultValue();
        }
      );
    }
  }

  async getQuota() {
    await fetchQuota(this, 0);
    setCreateVolumeSize(this.defaultSize);
    this.onCountChange(1);
    this.updateDefaultValue();
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get systemTabs() {
    const data = this.imageStore.list.data || [];
    const availableImages = data
      .filter((it) => it.status === 'active')
      .map((it) => ({
        ...it,
        key: it.id,
      }));
    const tabs = getImageSystemTabs() || [];
    return tabs.filter((tab) => {
      return availableImages.some((image) => getImageOS(image) === tab.value);
    });
  }

  getVolumeTypeExtra() {
    if (this.sourceTypeIsSnapshot) {
      return snapshotTypeTip;
    }
    const { multiattach = false } = this.state;
    return multiattach ? multiTip : undefined;
  }

  onConfirmCancel = () => {
    const { initVolumeType } = this.state;
    const { selectedRows, selectedRowKeys, snapshotId } = initVolumeType;
    const newValue = {
      selectedRows,
      selectedRowKeys,
      snapshotId: `${snapshotId}-1`,
    };
    this.setState({
      initVolumeType: newValue,
    });
  };

  onVolumeTypeChange = (value) => {
    const { selectedRows = [] } = value;
    if (selectedRows.length === 0) {
      setCreateVolumeType('');
      this.setState({
        multiattach: false,
      });
      return;
    }
    const {
      id,
      extra_specs: { multiattach = 'False' } = {},
      name,
    } = selectedRows[0];
    setCreateVolumeType(name);
    if (this.sourceTypeIsSnapshot) {
      const {
        initVolumeType: { selectedRowKeys = [] },
        confirmCount = 0,
      } = this.state;
      if (id !== selectedRowKeys[0] && confirmCount < 1) {
        Confirm.warn({
          title: t('Note: Are you sure you need to modify the volume type?'),
          content: snapshotTypeTip,
          onCancel: this.onConfirmCancel,
        });
        this.setState({
          confirmCount: 1,
        });
      }
    }
    this.setState({
      multiattach: multiattach === '<is> True',
    });
  };

  get sourceTypeIsImage() {
    const { source } = this.state;
    return source === this.sourceTypes[1].value;
  }

  get sourceTypeIsSnapshot() {
    const { source } = this.state;
    return source === this.sourceTypes[2].value;
  }

  getDiskMinSize() {
    let imageSize = 0;
    if (this.sourceTypeIsImage) {
      const { min_disk = 0, size = 0 } = this.state.image || {};
      const sizeGiB = Math.ceil(size / 1024 / 1024 / 1024);
      imageSize = Math.max(min_disk, sizeGiB, 1);
    } else if (this.sourceTypeIsSnapshot) {
      const { size = 0 } = this.state.snapshot || {};
      imageSize = size;
    }
    return Math.max(imageSize, 1);
  }

  onSnapshotChange = async (value) => {
    const { selectedRows = [] } = value || {};
    let volumeTypeId = '';
    let volumeType = null;
    if (selectedRows.length) {
      const { origin_data: { volume_type_id } = {}, id } =
        selectedRows[0] || {};
      if (!volume_type_id) {
        try {
          const detail = await this.snapshotStore.fetchDetail({ id });
          const {
            volume: { volume_type },
          } = detail || {};
          volumeType = this.volumeTypes.find((it) => it.name === volume_type);
          volumeTypeId = volumeType.id;
        } catch (e) {
          console.log('volume already not exist', e);
        }
      } else {
        volumeTypeId = volume_type_id;
        volumeType = this.volumeTypes.find((it) => it.id === volumeTypeId);
      }
      if (volumeType) {
        const newValue = {
          selectedRowKeys: [volumeTypeId],
          selectedRows: [volumeType],
          snapshotId: id,
        };
        this.setState({
          initVolumeType: newValue,
        });
      }
    }
  };

  get nameForStateUpdate() {
    return ['source', 'image', 'snapshot', 'size', 'volume_type'];
  }

  get formItems() {
    const { initVolumeType } = this.state;
    const minSize = this.getDiskMinSize();
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
        options: this.availableZones,
        tip: t(
          'Unless you know clearly which AZ to create the volume in, you don not need to fill in here.'
        ),
      },
      {
        type: 'divider',
      },
      {
        name: 'source',
        label: t('Data Source Type'),
        type: 'radio',
        options: this.sourceTypes,
        required: true,
        isWrappedValue: true,
      },
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        isLoading: this.imageStore.list.isLoading,
        required: this.sourceTypeIsImage,
        isMulti: false,
        hidden: !this.sourceTypeIsImage,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getImageColumns(this),
        tabs: this.systemTabs,
        defaultTabValue: this.systemTabs[0]?.value,
        selectedLabel: t('Image'),
        onTabChange: this.onImageTabChange,
      },
      {
        name: 'snapshot',
        label: t('Volume Snapshot'),
        type: 'select-table',
        backendPageStore: this.snapshotStore,
        required: this.sourceTypeIsSnapshot,
        isMulti: false,
        hidden: !this.sourceTypeIsSnapshot,
        isSortByBack: true,
        defaultSortKey: 'created_at',
        defaultSortOrder: 'descend',
        onChange: this.onSnapshotChange,
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
            title: t('Description'),
            dataIndex: 'description',
            sorter: false,
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            render: (time) => getSinceTime(time),
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        name: 'volume_type',
        label: t('Volume Type'),
        type: 'select-table',
        tip: t(
          'The volume type needs to set "multiattach" in the metadata to support shared volume attributes.'
        ),
        ...volumeTypeSelectProps,
        data: this.volumeTypes,
        isLoading: this.volumeTypeStore.list.isLoading,
        required: true,
        extra: this.getVolumeTypeExtra(),
        onChange: this.onVolumeTypeChange,
        initValue: initVolumeType,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GiB-${this.maxSize}GiB`,
        required: this.quotaIsLimit,
        hidden: !this.quotaIsLimit,
        onChange: onVolumeSizeChange,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: minSize,
        hidden: this.quotaIsLimit,
        required: !this.quotaIsLimit,
        onChange: onVolumeSizeChange,
      },
      {
        type: 'divider',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
  }

  onCountChangeCallback() {}

  onCountChange = (value) => {
    setCreateVolumeCount(value);
    this.setState(
      {
        count: value,
      },
      () => {
        if (this.onCountChangeCallback) {
          this.onCountChangeCallback();
        }
      }
    );
  };

  getCountMax = () => {
    const { volumes: { left = 0 } = {} } = this.getVolumeQuota();
    if (left === -1) {
      return Infinity;
    }
    return left;
  };

  renderFooterLeft() {
    const { count = 1 } = this.state;
    const max = this.getCountMax();
    const configs = {
      min: 1,
      max,
      precision: 0,
      onChange: this.onCountChange,
      formatter: (value) => `$ ${value}`.replace(/\D/g, ''),
    };
    return (
      <div>
        <span>{t('Count')}</span>
        <InputNumber
          {...configs}
          value={count}
          className={classnames(styles.input, 'volume-count')}
        />
      </div>
    );
  }

  onSubmit = (data) => {
    const { count } = this.state;
    if (this.message) {
      return Promise.reject(this.message);
    }
    const {
      backup,
      image,
      snapshot,
      size,
      availableZone,
      shared,
      name,
      volume_type,
    } = data;
    const volume = {
      name,
      size,
      availability_zone: availableZone !== 'noSelect' ? availableZone : null,
      multiattach: shared,
      volume_type: volume_type.selectedRowKeys[0],
    };
    if (
      backup &&
      Array.isArray(backup.selectedRowKeys) &&
      backup.selectedRowKeys.length
    ) {
      volume.backup_id = backup.selectedRowKeys[0];
    }
    if (
      image &&
      Array.isArray(image.selectedRowKeys) &&
      image.selectedRowKeys.length
    ) {
      volume.imageRef = image.selectedRowKeys[0];
    }
    if (
      snapshot &&
      Array.isArray(snapshot.selectedRowKeys) &&
      snapshot.selectedRowKeys.length
    ) {
      volume.snapshot_id = snapshot.selectedRowKeys[0];
    }
    if (count === 1) {
      return this.volumeStore.create(volume);
    }
    return allSettled(
      new Array(count).fill(count).map((_, index) => {
        const body = {
          ...volume,
          name: `${volume.name}-${index + 1}`,
        };
        return this.volumeStore.create(body);
      })
    );
  };
}

export default inject('rootStore')(observer(Create));
