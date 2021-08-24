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

import { action, observable } from 'mobx';
import { isOsDisk } from 'resources/volume';
import { renderFilterMap } from 'utils/index';
import client from 'client';
import Base from '../base';
import globalVolumeTypeStore from './volume-type';

export class VolumeStore extends Base {
  @observable
  volumeTypes = [];

  @observable
  originalvolumeTypes = [];

  @observable
  cinderServiceOptions = [];

  @observable
  quotaSet = {};

  get client() {
    return client.cinder.volumes;
  }

  get transferClient() {
    return client.cinder.volumeTransfers;
  }

  listFetchByClient(params, originParams) {
    const { recycle } = originParams;
    if (recycle) {
      return this.client.listDetail(params);
    }
    return this.skylineClient.extension.volumes(params);
  }

  get mapper() {
    return (volume) => ({
      ...volume,
      disk_tag: isOsDisk(volume) ? 'os_disk' : 'data_disk',
      description: volume.description || (volume.origin_data || {}).description,
      delete_interval:
        volume.metadata && volume.metadata.delete_interval
          ? new Date(renderFilterMap.toLocalTime(volume.updated_at)).getTime() +
            Number(volume.metadata.delete_interval) * 1000
          : null,
    });
  }

  get paramsFunc() {
    return (params) => {
      const { serverId, ...rest } = params;
      return rest;
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    const { recycle } = params;
    if (sortKey && sortOrder) {
      const dirs = sortOrder === 'descend' ? 'desc' : 'asc';
      if (recycle) {
        params.sort = `${sortKey}:${dirs}`;
      } else {
        params.sort_keys = sortKey;
        params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
      }
    }
  };

  async listDidFetch(items, _, filters) {
    const { withPrice } = filters;
    if (items.length === 0) {
      return items;
    }
    if (withPrice) {
      const volumeTypes = await globalVolumeTypeStore.fetchList({ withPrice });
      items.forEach((item) => {
        const { size, volume_type } = item;
        const volumeType = volumeTypes.find((it) => it.name === volume_type);
        const cost = volumeType ? (volumeType.priceCost * size).toFixed(2) : 0;
        item.cost = cost;
      });
    }
    const { serverId } = filters;
    return !serverId
      ? items
      : items.filter(
          (it) =>
            it.attachments.length > 0 &&
            it.attachments[0].server_id === serverId
        );
  }

  async detailDidFetch(item, all_projects, { withPrice }) {
    const { id } = item;
    try {
      const result = await this.fetchList({ uuid: id, all_projects });
      item.itemInList = result[0];
      item.attachmentsContrib = result[0].attachments;
    } catch (e) {}
    if (withPrice) {
      const volumeTypes = await globalVolumeTypeStore.fetchList({ withPrice });
      const { size, volume_type } = item;
      const volumeType = volumeTypes.find((it) => it.name === volume_type);
      const cost = volumeType ? (volumeType.priceCost * size).toFixed(2) : 0;
      item.cost = cost;
    }
    return item;
  }

  @action
  async fetchQuota() {
    const result = await client.cinder.quotaSets.show(this.currentProjectId, {
      usage: 'True',
    });
    this.quotaSet = result.quota_set;
  }

  @action
  async fetchAvailabilityZoneList() {
    const result = await client.cinder.azones.list();
    this.availabilityZones = result.availabilityZoneInfo;
  }

  @action
  async operation(id, data, key) {
    const body = { [key]: data };
    return this.submitting(this.client.action(id, body));
  }

  @action
  async migrate(id, data) {
    return this.operation(id, data, 'os-migrate_volume');
  }

  @action
  async uploadImage(id, data) {
    return this.operation(id, data, 'os-volume_upload_image');
  }

  @action
  revert(id, data) {
    return this.operation(id, data, 'revert_any');
  }

  @action
  extendSize(id, data) {
    return this.operation(id, data, 'os-extend');
  }

  @action
  retype(id, data) {
    return this.operation(id, data, 'os-retype');
  }

  @action
  resetStatus(id, data) {
    return this.operation(id, data, 'os-reset_status');
  }

  @action
  update(id, data) {
    const body = { [this.responseKey]: data };
    return this.submitting(this.client.update(id, body));
  }

  @action
  softDelete(id, data) {
    return this.operation(id, data, 'os-recycle');
  }

  restore(id) {
    return this.operation(id, {}, 'os-restore-recycle');
  }

  @action
  createTransfer(data) {
    const body = { transfer: data };
    return this.submitting(this.transferClient.create(body));
  }

  @action
  cancelTransfer({ id }) {
    return this.submitting(this.transferClient.list()).then((resData) => {
      const findObj = (resData.transfers || []).find((s) => s.volume_id === id);
      return this.submitting(this.transferClient.delete(findObj.id));
    });
  }

  @action
  acceptVolumeTransfer(transfer_id, data) {
    const body = { accept: data };
    return this.submitting(this.transferClient.accept(transfer_id, body));
  }

  @action
  async fetchVolumeTypes(params) {
    const datas = await globalVolumeTypeStore.fetchList(params);
    this.volumeTypes = datas.map((it) => ({
      label: it.name,
      value: it.id,
    }));
    this.originalvolumeTypes = datas || [];
  }
}

const globalVolumeStore = new VolumeStore();
export default globalVolumeStore;

export const globalRecycleVolumeStore = new VolumeStore();
