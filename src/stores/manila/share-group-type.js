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
import client from 'client';
import Base from 'stores/base';

export class ShareGroupTypeStore extends Base {
  @observable
  access = [];

  get client() {
    return client.manila.shareGroupTypes;
  }

  get shareTypeClient() {
    return client.manila.types;
  }

  get paramsFunc() {
    return (params) => {
      const { keywords, ...rest } = params;
      return rest;
    };
  }

  @action
  async create(data, projectIds = []) {
    const body = {};
    body[this.responseKey] = data;
    if (projectIds.length === 0) {
      return this.submitting(this.client.create(body));
    }
    this.isSubmitting = true;
    const result = await this.client.create(body);
    const { id } = result[this.responseKey];
    return this.addProjectAccess(id, projectIds);
  }

  async listDidFetch(items, _, filters) {
    if (!items.length) {
      return items;
    }
    const { is_public } = filters;
    const params = is_public === 'all' ? { is_public } : {};
    const result = await this.shareTypeClient.list(params);
    const { share_types: types = [] } = result;
    return items.map((it) => {
      const { share_types = [] } = it;
      return {
        ...it,
        shareTypes: share_types
          .map((typeId) => types.find((t) => t.id === typeId))
          .filter((t) => !!t), // to filter private type invisible to current project
      };
    });
  }

  async detailDidFetch(item, all_projects) {
    const params = all_projects ? { is_public: 'all' } : {};
    const result = await this.shareTypeClient.list(params);
    const { share_types: types = [] } = result;
    const { share_types = [] } = item;
    return {
      ...item,
      shareTypes: share_types
        .map((typeId) => types.find((t) => t.id === typeId))
        .filter((t) => !!t), // to filter private type invisible to current project
    };
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }

  @action
  addProjectAccess(id, projectIds = []) {
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            addProjectAccess: {
              project: it,
            },
          };
          return this.client.action(id, actionBody);
        })
      )
    );
  }

  @action
  removeProjectAccess(id, projectIds = []) {
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            removeProjectAccess: {
              project: it,
            },
          };
          return this.client.action(id, actionBody);
        })
      )
    );
  }

  @action
  async updateProjectAccess({ id, adds = [], dels = [], newPublic }) {
    const more = adds.length > 0 || dels.length > 0;
    if (newPublic !== undefined) {
      if (newPublic || !more) {
        return this.update(id, { 'share_type_access:is_public': newPublic });
      }
      await this.update(id, { 'share_type_access:is_public': newPublic });
    }
    await this.removeProjectAccess(id, dels);
    return this.addProjectAccess(id, adds);
  }

  @action
  async fetchProjectAccess(id) {
    const result = await this.client.getAccess(id);
    this.access = result.share_group_type_access;
  }
}

const globalShareGroupTypeStore = new ShareGroupTypeStore();
export default globalShareGroupTypeStore;
