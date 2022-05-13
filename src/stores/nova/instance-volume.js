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

import { isOsDisk } from 'resources/cinder/volume';
import client from 'client';
import Base from 'stores/base';

export class InstanceVolumeStore extends Base {
  get client() {
    return client.nova.servers.volumeAttachments;
  }

  get isSubResource() {
    return true;
  }

  getFatherResourceId = (params) => params.serverId;

  get paramsFunc() {
    return (params) => {
      const { id, serverId, all_projects, projectId, serverName, ...rest } =
        params;
      return rest;
    };
  }

  get mapperBeforeFetchProject() {
    return (data, filters) => {
      const { projectId } = filters;
      return {
        ...data,
        project_id: projectId,
      };
    };
  }

  get mapper() {
    return (volume) => ({
      ...volume,
      disk_tag: isOsDisk(volume) ? 'os_disk' : 'data_disk',
      host: volume['os-vol-host-attr:host'],
    });
  }

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { serverName, serverId } = filters;
    const { project_id, project_name } = items[0];
    const results = await Promise.all(
      items.map((it) => {
        const { volumeId } = it;
        return client.cinder.volumes.show(volumeId);
      })
    );
    const volumes = results.map((result) => {
      const { volume } = result;
      const { attachments = [] } = volume;
      const newAttachments = attachments.filter(
        (it) => it.server_id === serverId
      );
      newAttachments.forEach((it) => {
        it.server_name = serverName;
      });
      volume.attachments = newAttachments;
      return {
        ...volume,
        project_id,
        project_name,
      };
    });
    return volumes;
  }
}

const globalInstanceVolumeStore = new InstanceVolumeStore();
export default globalInstanceVolumeStore;
