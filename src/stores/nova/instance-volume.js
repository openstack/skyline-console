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

import client from 'client';
import Base from 'stores/base';
import { groupArray } from 'utils/index';
import { updateVolume } from 'resources/cinder/volume';

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
    return (volume) => updateVolume(volume);
  }

  get groupArraySize() {
    return 10;
  }

  async listDidFetch(items, allProjects) {
    if (items.length === 0) {
      return items;
    }
    const volumeIds = items.map((it) => it.volumeId);
    const idArray = groupArray(volumeIds, this.groupArraySize);
    const results = await Promise.all(
      idArray.map((it) => {
        const newParams = { uuid: it, all_projects: allProjects };
        return this.skylineClient.extension.volumes(newParams);
      })
    );
    const resultVolumes = [];
    results.forEach((result) => {
      resultVolumes.push(...result.volumes);
    });
    return resultVolumes;
  }
}

const globalInstanceVolumeStore = new InstanceVolumeStore();
export default globalInstanceVolumeStore;
