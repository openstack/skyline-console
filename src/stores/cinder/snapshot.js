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
import { cinderBase, skylineBase } from 'utils/constants';
import Base from '../base';

export class SnapshotStore extends Base {
  @observable
  allSnapshotList = [];

  get module() {
    if (!globals.user) {
      return null;
    }
    return `${globals.user.project.id}/snapshots`;
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'snapshot';
  }

  get listResponseKey() {
    return 'volume_snapshots';
  }

  get paramsFunc() {
    return (params) => {
      const { id, ...rest } = params;
      return rest;
    };
  }

  getListPageUrl = () => `${skylineBase()}/extension/volume_snapshots`;

  getListDetailUrl = () => `${skylineBase()}/extension/volume_snapshots`;

  async listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { id } = filters;
    const datas = id ? items.filter((it) => it.volume_id === id) : items;
    return datas;
  }

  async detailDidFetch(item) {
    const { volume_id } = item;
    const volumeUrl = `${cinderBase()}/${
      globals.user.project.id
    }/volumes/${volume_id}`;
    const { volume } = await request.get(volumeUrl);
    item.volume = volume;
    return item;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  @action
  fetchAllList() {
    return request.get(this.getListUrl()).then((res) => {
      const list = res.snapshots || [];
      this.allSnapshotList = list;
      return list;
    });
  }

  @action
  update(id, data) {
    const body = { [this.responseKey]: data };
    return this.submitting(request.put(this.getDetailUrl({ id }), body));
  }
}
const globalSnapshotStore = new SnapshotStore();
export default globalSnapshotStore;
