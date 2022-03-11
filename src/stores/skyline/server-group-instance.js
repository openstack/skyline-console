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

import { groupArray } from 'utils/index';
import Base from 'stores/base';

export class ServerGroupInstanceStore extends Base {
  get listResponseKey() {
    return 'servers';
  }

  get paramsFunc() {
    return (params) => {
      const { all_projects, members, isServerGroup, ...rest } = params;
      return rest;
    };
  }

  get groupArraySize() {
    return 1;
  }

  async requestList(params, filters) {
    const { members, isServerGroup, all_projects } = filters;
    if (members && isServerGroup && members.length === 0) {
      return [];
    }
    const memberArrs = groupArray(members, this.groupArraySize);
    const results = await Promise.all(
      memberArrs.map((it) => {
        const newParams = { ...params, uuid: it, all_projects };
        return this.skylineClient.extension.servers(newParams);
      })
    );
    const servers = [];
    results.forEach((result) => {
      servers.push(...result[this.listResponseKey]);
    });
    return servers;
  }

  async listDidFetch(items) {
    if (items.length === 0) {
      return items;
    }
    return items.map((it) => ({
      ...it,
      tags: (it.origin_data || {}).tags || [],
    }));
  }
}

const globalServerGroupInstanceStore = new ServerGroupInstanceStore();
export default globalServerGroupInstanceStore;
