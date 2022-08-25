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

import Base from 'stores/base';
import { groupArray } from 'utils/index';
import { updateVolume } from 'resources/cinder/volume';

export class SnapshotVolumeStore extends Base {
  get mapper() {
    return (volume) => updateVolume(volume);
  }

  get groupArraySize() {
    return 10;
  }

  async requestList(params, filters) {
    const { volumeIds = [] } = filters;
    const idArray = groupArray(volumeIds, this.groupArraySize);
    const results = await Promise.all(
      idArray.map((it) => {
        const newParams = { uuid: it, ...params };
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

const globalSnapshotVolumeStore = new SnapshotVolumeStore();
export default globalSnapshotVolumeStore;
