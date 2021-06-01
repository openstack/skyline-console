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
import { cinderBase } from 'utils/constants';
import Base from '../base';

export class VolumeTypeStore extends Base {
  @observable
  access = [];

  get module() {
    if (!globals.user) {
      return null;
    }
    return `${globals.user.project.id}/types`;
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'volume_type';
  }

  get listFilterByProject() {
    return false;
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, showEncryption, ...rest } = params;
      return rest;
    };
  }

  get mapper() {
    return (data) => {
      const { extra_specs: { multiattach = 'False' } = {} } = data;
      return {
        ...data,
        multiattach: multiattach === '<is> True',
      };
    };
  }

  async listDidFetch(items, allProjects, filters) {
    const { showEncryption } = filters;
    if (items.length === 0) {
      return items;
    }
    if (!showEncryption) {
      return items;
    }
    const promiseList = items.map((i) =>
      request.get(`${this.getDetailUrl({ id: i.id })}/encryption`)
    );
    const encryptionList = await Promise.all(promiseList);
    const result = items.map((i) => {
      const { id } = i;
      const encryption = encryptionList.find((e) => e.volume_type_id === id);
      return {
        ...i,
        encryption,
      };
    });
    return result;
  }

  async detailDidFetch(item) {
    const { id } = item || {};
    const result = await request.get(`${this.getDetailUrl({ id })}/encryption`);
    item.encryption = result;
    return item;
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(request.put(this.getDetailUrl({ id }), body));
  }

  @action
  createEncryption(id, data) {
    const body = {
      encryption: data,
    };
    return this.submitting(
      request.post(`${this.getDetailUrl({ id })}/encryption`, body)
    );
  }

  @action
  deleteEncryption(id, encryption_id) {
    return this.submitting(
      request.delete(`${this.getDetailUrl({ id })}/encryption/${encryption_id}`)
    );
  }

  @action
  async create(data, projectIds = []) {
    const body = {};
    body[this.responseKey] = data;
    if (projectIds.length === 0) {
      return this.submitting(request.post(this.getListUrl(), body));
    }
    this.isSubmitting = true;
    const result = await request.post(this.getListUrl(), body);
    const { id } = result[this.responseKey];
    return this.addProjectAccess(id, projectIds);
  }

  @action
  addProjectAccess(id, projectIds = []) {
    const actionUrl = `${this.getDetailUrl({ id })}/action`;
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            addProjectAccess: {
              project: it,
            },
          };
          return request.post(actionUrl, actionBody);
        })
      )
    );
  }

  @action
  removeProjectAccess(id, projectIds = []) {
    const actionUrl = `${this.getDetailUrl({ id })}/action`;
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            removeProjectAccess: {
              project: it,
            },
          };
          return request.post(actionUrl, actionBody);
        })
      )
    );
  }

  @action
  async fetchProjectAccess(id) {
    const url = `${this.getDetailUrl({ id })}/os-volume-type-access`;
    const result = await request.get(url);
    this.access = result.volume_type_access;
  }

  @action
  async updateProjectAccess({ id, adds = [], dels = [], newPublic }) {
    const more = adds.length > 0 || dels.length > 0;
    if (newPublic !== undefined) {
      if (newPublic || !more) {
        return this.update(id, { is_public: newPublic });
      }
      await this.update(id, { is_public: newPublic });
    }
    await this.removeProjectAccess(id, dels);
    return this.addProjectAccess(id, adds);
  }
}
const globalVolumeTypeStore = new VolumeTypeStore();
export default globalVolumeTypeStore;
