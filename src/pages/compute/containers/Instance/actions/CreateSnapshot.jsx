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
import { Table } from 'antd';
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import {
  checkStatus,
  isIronicInstance,
  isBootFromVolume,
} from 'resources/nova/instance';
import { InstanceVolumeStore } from 'stores/nova/instance-volume';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalProjectStore from 'stores/keystone/project';
import { idNameColumn } from 'utils/table';

export const getWishes = () => {
  const { volumesForSnapshot = [] } = globalServerStore;
  if (!volumesForSnapshot.length) {
    return {
      total: 0,
      types: {},
    };
  }
  const types = volumesForSnapshot.reduce((pre, cur) => {
    const { volume_type: type } = cur;
    if (pre[type]) {
      pre[type] += 1;
    } else {
      pre[type] = 1;
    }
    return pre;
  }, {});
  return { types, total: volumesForSnapshot.length };
};

export const getQuota = (cinderQuota) => {
  const { snapshots: snapshotQuota = {} } = cinderQuota || {};
  const { types = {} } = getWishes();
  const typesQuota = Object.keys(types || {}).reduce((pre, cur) => {
    pre[cur] = (cinderQuota || {})[`snapshots_${cur}`] || {};
    return pre;
  }, {});
  return {
    snapshotQuota,
    ...typesQuota,
  };
};

export const getZero = (cinderQuota) => {
  const { types = {} } = getWishes();
  const allQuota = getQuota(cinderQuota) || {};
  const { snapshotQuota = {} } = allQuota;
  const zero = [
    { ...snapshotQuota, add: 0, name: 'snapshot', title: t('Volume Snapshot') },
  ];
  Object.keys(types).forEach((type) => {
    const typeQuota = allQuota[type] || {};
    zero.push({
      ...typeQuota,
      add: 0,
      name: type,
      title: t('{name} type snapshots', { name: type }),
      type: 'line',
    });
  });
  return zero;
};

export const getAdd = (cinderQuota) => {
  const zero = getZero(cinderQuota);
  const { types = {}, total = 0 } = getWishes();
  const allQuota = getQuota(cinderQuota) || {};
  const { snapshotQuota } = allQuota;
  const { left = 0 } = snapshotQuota || {};
  if (left !== -1 && left < total) {
    return zero;
  }
  const needQuota = JSON.parse(JSON.stringify(zero));
  needQuota[0].add = total;
  let typeQuotaIsOK = true;
  Object.keys(types).forEach((type, index) => {
    if (typeQuotaIsOK) {
      const typeQuota = allQuota[type];
      const { left: typeLeft = 0 } = typeQuota || {};
      const typeTotal = types[type];
      if (typeLeft !== -1 && typeLeft < typeTotal) {
        typeQuotaIsOK = false;
      } else {
        needQuota[index + 1].add = typeTotal;
      }
    }
  });
  return typeQuotaIsOK ? needQuota : zero;
};

export class CreateSnapshot extends ModalAction {
  static id = 'create-snapshot';

  static title = t('Create Instance Snapshot');

  static buttonText = t('Create Snapshot');

  init() {
    this.store = globalServerStore;
    this.volumeStore = new InstanceVolumeStore();
    this.volumeTypeStore = globalVolumeTypeStore;
    this.getQuota();
  }

  get name() {
    return t('create instance snapshot');
  }

  get tips() {
    const volumeTip = t(
      'The instance which is boot from volume will create snapshots for each mounted volumes.'
    );
    return (
      t(
        'A snapshot is an image which preserves the disk state of a running instance, which can be used to start a new instance.'
      ) + volumeTip
    );
  }

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  get instanceName() {
    return this.values.snapshot;
  }

  get isBootFromVolume() {
    return isBootFromVolume(this.item);
  }

  get showQuota() {
    return this.isBootFromVolume;
  }

  get quotaInfo() {
    const { quota, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    return getAdd(quota);
  }

  static get disableSubmit() {
    const { volumesForSnapshot = [] } = globalServerStore;
    if (!volumesForSnapshot.length) {
      return false;
    }
    const { cinderQuota } = globalProjectStore;
    const quotaInfo = getAdd(cinderQuota);
    if (quotaInfo[0].add === 0) {
      return true;
    }
    return false;
  }

  async getQuota() {
    this.store.setVolumesForSnapshot([]);
    this.setState({
      quota: {},
      quotaLoading: true,
    });
    const reqs = [
      globalProjectStore.fetchProjectCinderQuota(),
      this.isBootFromVolume
        ? this.volumeStore.fetchList({ serverId: this.item.id })
        : null,
    ];
    const [quota, volumes] = await Promise.all(reqs);
    this.store.setVolumesForSnapshot(volumes || []);
    this.setState({
      quota,
      quotaLoading: false,
      volumes: volumes || [],
    });
  }

  getVolumes() {
    if (!this.isBootFromVolume) {
      return null;
    }
    const { volumes = [] } = this.state;
    const columns = [
      idNameColumn,
      {
        dataIndex: 'size',
        title: t('Size'),
        render: (value) => `${value}GiB`,
      },
      {
        dataIndex: 'volume_type',
        title: t('Volume Type'),
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={volumes}
        rowKey="id"
        pagination={false}
      />
    );
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      snapshot: '',
    };
    return value;
  }

  static isSnapshotReadyState = (item) =>
    checkStatus(['active', 'shutoff', 'suspended'], item);

  static policy = 'os_compute_api:servers:create_image';

  static allowed = (item) =>
    Promise.resolve(this.isSnapshotReadyState(item) && !isIronicInstance(item));

  get formItems() {
    const items = [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'snapshot',
        label: t('Instance Snapshot Name'),
        type: 'input-name',
        isImage: true,
        required: true,
      },
    ];
    if (this.isBootFromVolume) {
      items.push({
        name: 'volumes',
        label: t('Volumes'),
        type: 'label',
        content: this.getVolumes(),
      });
    }
    return items;
  }

  onSubmit = (values) => {
    const { snapshot } = values;
    const { id } = this.item;
    return this.store.createImage({ id, image: snapshot });
  };
}

export default inject('rootStore')(observer(CreateSnapshot));
