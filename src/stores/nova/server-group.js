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

import { novaBase } from 'utils/constants';
import { get } from 'lodash';
import Base from '../base';

export class ServerGroupStore extends Base {
  get module() {
    return 'os-server-groups';
  }

  get apiVersion() {
    return novaBase();
  }

  get responseKey() {
    return 'server_group';
  }

  get fetchListByLimit() {
    return true;
  }

  async requestListByMarker(url, params, limit, marker) {
    const newParams = {
      ...params,
      limit,
    };
    if (marker) {
      newParams.offset = marker;
    }
    return request.get(url, newParams);
  }

  async requestListAllByLimit(url, params, limit) {
    let marker = '';
    let hasNext = true;
    let datas = [];
    while (hasNext) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.requestListByMarker(url, params, limit, marker);
      const data = this.listResponseKey
        ? get(result, this.listResponseKey, [])
        : result;
      datas = [...datas, ...data];
      if (data.length >= limit) {
        marker = datas.length;
      } else {
        hasNext = false;
      }
    }
    return datas;
  }
}

const globalServerGroupStore = new ServerGroupStore();
export default globalServerGroupStore;
