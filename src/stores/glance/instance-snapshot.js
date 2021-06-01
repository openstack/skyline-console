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

import { glanceBase, cinderBase, novaBase } from 'utils/constants';
import Base from '../base';

export class InstanceSnapshotStore extends Base {
  get module() {
    return 'images';
  }

  get apiVersion() {
    return glanceBase();
  }

  get responseKey() {
    return 'image';
  }

  get listFilterByProject() {
    return true;
  }

  get fetchListByLimit() {
    return false;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  get paramsFuncPage() {
    return (params, all_projects) => {
      const { id, current, ...rest } = params;
      const newParams = {
        ...rest,
        // image_type: 'snapshot',
      };
      if (!all_projects) {
        newParams.owner = this.currentProject;
      }
      return newParams;
    };
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      ...data,
      project_name: data.owner_project_name || data.project_name,
    });
  }

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { id } = filters;
    if (!id) {
      return items;
    }
    const snapshotsUrl = `${cinderBase()}/${globals.user.project.id}/snapshots`;
    const volumesUrl = `${novaBase()}/servers/${id}/os-volume_attachments`;
    const volumeParams = {};
    const snapshotParams = { all_tenants: allProjects };
    const results = await Promise.all([
      request.get(snapshotsUrl, snapshotParams),
      request.get(volumesUrl, volumeParams),
    ]);
    const snapshotsAll = results[0].snapshots;
    const volumesAll = results[1].volumeAttachments;
    const datas = [];
    items.forEach((data) => {
      const { block_device_mapping: bdm = '[]' } = data;
      const snapshot = JSON.parse(bdm).find((it) => it.boot_index === 0);
      if (snapshot) {
        data.snapshotId = snapshot.snapshot_id;
        const snapshotDetail = snapshotsAll.find(
          (it) => it.id === snapshot.snapshot_id
        );
        if (snapshotDetail) {
          const volumeId = snapshotDetail.volume_id;
          const volume = volumesAll.find((it) => it.volumeId === volumeId);
          if (volume) {
            datas.push(data);
          }
        }
      } else {
        const { instance_uuid: instanceId } = data;
        if (id === instanceId) {
          datas.push(data);
        }
      }
    });
    return datas;
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
      const currentProject = globals.user.project.id;
      const snapshotsUrl = `${cinderBase()}/${currentProject}/snapshots/${snapshotId}`;
      const snapshotResult = await request.get(snapshotsUrl);
      const snapshotDetail = snapshotResult.snapshot;
      item.snapshotDetail = snapshotDetail;
      const { volume_id: volumeId } = snapshotDetail;
      const volumeUrl = `${cinderBase()}/${
        globals.user.project.id
      }/volumes/${volumeId}`;
      const volumeResult = await await request.get(volumeUrl);
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
    try {
      if (instanceId) {
        const instanceUrl = `${novaBase()}/servers/${instanceId}`;
        const instanceResult = await request.get(instanceUrl);
        const { server: { name } = {} } = instanceResult;
        instanceName = name;
      }
    } catch (e) {}
    item.instance = {
      server_id: instanceId,
      server_name: instanceName,
    };
    return item;
  }
}

const globalInstanceSnapshotStore = new InstanceSnapshotStore();
export default globalInstanceSnapshotStore;
