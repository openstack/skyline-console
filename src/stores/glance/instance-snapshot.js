// Copyright 2022 99cloud
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

import client from 'client';
import { isSnapshot } from 'src/resources/glance/image';
import { cloneDeep } from 'lodash';
import Base from '../base';

export class InstanceSnapshotStore extends Base {
  get client() {
    return client.glance.images;
  }

  get listFilterByProject() {
    return true;
  }

  get fetchListByLimit() {
    return true;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  updateParamsSort = this.updateParamsSortPage;

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  get paramsFuncPage() {
    return (params, all_projects) => {
      const { id, current, owner, ...rest } = params;
      const newParams = {
        ...rest,
      };
      if (owner) {
        newParams.owner = owner;
      } else if (!all_projects) {
        newParams.owner = this.currentProjectId;
      }
      return newParams;
    };
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      ...data,
      project_name: data.owner_project_name || data.project_name,
      project_id: data.owner || data.project_id,
    });
  }

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const newItems = items.filter(isSnapshot);
    const { id } = filters;
    if (!id) {
      return newItems;
    }
    const volumeParams = {};
    const snapshotParams = { all_tenants: allProjects };
    const results = await Promise.all([
      client.cinder.snapshots.list(snapshotParams),
      client.nova.servers.volumeAttachments.list(id, volumeParams),
    ]);
    const snapshotsAll = results[0].snapshots;
    const volumesAll = results[1].volumeAttachments;
    const data = [];
    newItems.forEach((item) => {
      const { block_device_mapping: bdm = '[]', instance_id } = item;
      if (instance_id === id) {
        data.push(item);
      } else {
        const snapshot = JSON.parse(bdm).find((it) => it.boot_index === 0);
        if (snapshot) {
          item.snapshotId = snapshot.snapshot_id;
          const snapshotDetail = snapshotsAll.find(
            (it) => it.id === snapshot.snapshot_id
          );
          if (snapshotDetail) {
            const volumeId = snapshotDetail.volume_id;
            const volume = volumesAll.find((it) => it.volumeId === volumeId);
            if (volume) {
              data.push(item);
            }
          }
        } else {
          const { instance_uuid: instanceId } = item;
          if (id === instanceId) {
            data.push(item);
          }
        }
      }
    });
    return data;
  }

  async detailDidFetch(item) {
    item.originData = { ...item };
    const { block_device_mapping: bdm = '[]' } = item;
    const snapshot = JSON.parse(bdm).find((it) => it.boot_index === 0);
    let instanceId = null;
    let instanceName = '';
    if (snapshot) {
      const { snapshot_id: snapshotId } = snapshot;
      item.snapshotId = snapshotId;
      const snapshotResult = await client.cinder.snapshots.show(snapshotId);
      const snapshotDetail = snapshotResult.snapshot;
      item.snapshotDetail = snapshotDetail;
      const { volume_id: volumeId } = snapshotDetail;
      const volumeResult = await client.cinder.volumes.show(volumeId);
      const volumeDetail = volumeResult.volume;
      item.volumeDetail = volumeDetail;
      instanceId =
        volumeDetail.attachments.length > 0
          ? volumeDetail.attachments[0].server_id
          : '';
    } else {
      // fix for not bfv instance
      const { instance_uuid } = item;
      instanceId = instance_uuid;
    }
    let instanceResult = {};
    try {
      if (instanceId) {
        instanceResult = await client.nova.servers.show(instanceId);
        const { server: { name } = {} } = instanceResult;
        instanceName = name;
      }
    } catch (e) {}
    item.instance = {
      server_id: instanceId,
      server_name: instanceName,
    };
    item.instanceDetail = instanceResult.server || {};
    return item;
  }

  async fetchInstanceSnapshotVolumeData({ id }) {
    const snapshotDetailInfo = await this.client.show(id);
    const instanceSnapshotDetail = await this.detailDidFetch(
      snapshotDetailInfo
    );
    const { block_device_mapping: bdm = '[]' } = instanceSnapshotDetail;
    const bdmFormatData = JSON.parse(bdm) || [];
    if (!bdmFormatData?.length) {
      return instanceSnapshotDetail;
    }
    const snapshotsOfDataDisk = bdmFormatData?.filter(
      (it) => it.boot_index !== 0
    );
    const snapshotsReqs = snapshotsOfDataDisk.map(async (i) => {
      const snapshot = cloneDeep(i);
      const { snapshot_id } = i;
      const snapshotResult = await client.cinder.snapshots.show(snapshot_id);
      const snapshotDetail = snapshotResult?.snapshot || {};
      snapshot.snapshotDetail = snapshotDetail;
      snapshot.bdmFormatData = i;
      return snapshot;
    });
    const snapshotsOfDataDiskRes = await Promise.all(snapshotsReqs);
    const volumesReqs = snapshotsOfDataDiskRes.map(async (i) => {
      const { volume_id } = i.snapshotDetail;
      const volumesResult = await client.cinder.volumes.show(volume_id);
      const volumeDetail = volumesResult?.volume || {};
      i.volumeDetail = volumeDetail;
      return i;
    });
    const instanceSnapshotDataVolumes = await Promise.all(volumesReqs);
    return {
      ...instanceSnapshotDetail,
      instanceSnapshotDataVolumes,
    };
  }
}

const globalInstanceSnapshotStore = new InstanceSnapshotStore();
export default globalInstanceSnapshotStore;
