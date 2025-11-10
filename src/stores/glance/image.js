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
import { imageOS, isSnapshot } from 'resources/glance/image';
import { isString } from 'lodash';

export class ImageStore extends Base {
  @observable
  members = [];

  get client() {
    return client.glance.images;
  }

  get fetchListByLimit() {
    return true;
  }

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  updateParamsSort = this.updateParamsSortPage;

  get paramsFuncPage() {
    return (params) => {
      const { current, all_projects, ...rest } = params;
      return {
        ...rest,
      };
    };
  }

  get mapperBeforeFetchProject() {
    return (data, filters, isDetail) => {
      if (isDetail) {
        return {
          originData: { ...data },
          ...data,
          project_id: data.owner,
        };
      }
      return {
        originData: { ...data },
        ...data,
        project_id: data.owner,
        project_name: data.owner_project_name || data.project_name,
      };
    };
  }

  get mapper() {
    return (data) => {
      const os_distro = data?.os_distro?.toLowerCase?.() ?? '';
      const os = imageOS[os_distro] ? os_distro : 'others';
      return {
        ...data,
        os_distro: os,
      };
    };
  }

  listDidFetch(items) {
    if (items.length === 0) {
      return items;
    }
    return items.filter((it) => !isSnapshot(it));
  }

  @action
  async uploadImage(imageId, file, conf) {
    return this.client.uploadFile(imageId, file, conf);
  }

  @action
  async importFileUrl(imageId, uri) {
    const data = {
      method: {
        name: 'web-download',
        uri,
      },
    };
    return this.client.import(imageId, data);
  }

  @action
  async create(data, file, members, conf) {
    this.isSubmitting = true;
    const image = await this.client.create(data);
    const { id } = image;
    // return this.submitting(this.uploadImage(id, file));
    if (members.length > 0) {
      await Promise.all(members.map((it) => this.createMember(id, it)));
    }
    if (isString(file)) {
      await this.importFileUrl(id, file);
    } else {
      await this.uploadImage(id, file, conf);
    }
    this.isSubmitting = false;
    return Promise.resolve();
  }

  @action
  async update({ id }, newBody) {
    return this.client.patch(id, newBody);
  }

  @action
  async getMembers(id) {
    const result = await this.client.members.list(id);
    const { members = [] } = result || {};
    this.members = members;
    return members;
  }

  @action
  async createMember(id, member) {
    const body = {
      member,
    };
    await this.client.members.create(id, body);
    return this.updateMemberStatus(id, member, 'accepted');
  }

  @action
  async updateMemberStatus(id, member, status) {
    const body = {
      status,
    };
    return this.client.members.update(id, member, body);
  }

  @action
  async deleteMember(id, member) {
    return this.client.members.delete(id, member);
  }

  @action
  async updateMembers(id, adds, dels) {
    this.isSubmitting = true;
    await Promise.all(adds.map((it) => this.createMember(id, it)));
    return this.submitting(
      Promise.all(dels.map((it) => this.deleteMember(id, it)))
    );
  }
}

const globalImageStore = new ImageStore();
export default globalImageStore;
