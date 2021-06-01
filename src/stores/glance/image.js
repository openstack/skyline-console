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

import { glanceBase } from 'utils/constants';
import { action, observable } from 'mobx';
import Base from '../base';
// import { getArrayBuffer } from 'utils/file';

export class ImageStore extends Base {
  @observable
  members = [];

  get module() {
    return 'images';
  }

  get apiVersion() {
    return glanceBase();
  }

  get responseKey() {
    return 'image';
  }

  // get listFilterByProject() {
  //   // use it for nuetron apois
  //   return true;
  // }

  get fetchListByLimit() {
    return true;
  }

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, all_projects, ...rest } = params;
      return {
        ...rest,
        // image_type: 'image',
      };
    };
  }

  get mapperBeforeFetchProject() {
    return (data, filters, isDetail) => {
      if (isDetail) {
        return {
          ...data,
          project_id: data.owner,
        };
      }
      return {
        ...data,
        project_id: data.owner,
        project_name: data.owner_project_name || data.project_name,
      };
    };
  }

  @action
  async uploadImage(imageId, file) {
    const url = `${this.getListUrl()}/${imageId}/file`;
    // const body = await getArrayBuffer(file);
    const body = file;
    const headers = {
      'content-type': 'application/octet-stream',
    };

    const options = {
      headers,
    };
    return request.put(url, body, options);
  }

  @action
  async create(data, file, members) {
    this.isSubmitting = true;
    const image = await request.post(this.getListUrl(), data);
    const { id } = image;
    // return this.submitting(this.uploadImage(id, file));
    if (members.length > 0) {
      await Promise.all(members.map((it) => this.createMember(id, it)));
    }
    await this.uploadImage(id, file);
    this.isSubmitting = false;
    return Promise.resolve();
  }

  @action
  async update({ id }, newbody) {
    const url = this.getDetailUrl({ id });
    const headers = {
      'content-type': 'application/openstack-images-v2.1-json-patch',
    };
    const options = {
      headers,
    };
    return request.patch(url, newbody, options);
  }

  @action
  async getMembers(id) {
    const url = `${this.getDetailUrl({ id })}/members`;
    const result = await request.get(url);
    const { members = [] } = result || {};
    this.members = members;
    return members;
  }

  @action
  async createMember(id, member) {
    const url = `${this.getDetailUrl({ id })}/members`;
    const body = {
      member,
    };
    await request.post(url, body);
    return this.updateMemberStatus(id, member, 'accepted');
  }

  @action
  async updateMemberStatus(id, member, status) {
    const url = `${this.getDetailUrl({ id })}/members/${member}`;
    const body = {
      status,
    };
    return request.put(url, body);
  }

  @action
  async deleteMember(id, member) {
    const url = `${this.getDetailUrl({ id })}/members/${member}`;
    return request.delete(url);
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
