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

import { octaviaBase } from 'utils/constants';
import { action } from 'mobx';
import Base from '../base';

export class PoolMemberStore extends Base {
  get module() {
    return 'lbaas/pools';
  }

  get apiVersion() {
    return octaviaBase();
  }

  get responseKey() {
    return 'member';
  }

  get listResponseKey() {
    return 'members';
  }

  get listFilterByProject() {
    return true;
  }

  updateUrl = (url, params) => {
    const { pool_id } = params;
    return `${url}/${pool_id}/members`;
  };

  @action
  create({ default_pool_id, data }) {
    const body = {};
    body[this.listResponseKey] = data;
    return this.submitting(
      request.post(`${this.getListUrl()}/${default_pool_id}/members`, body)
    );
  }

  // @action
  // update({ default_pool_id, data }) {
  //   const body = {};
  //   body[this.listResponseKey] = data;
  //   return this.submitting(request.put(`${this.getListUrl()}/${default_pool_id}/members`, body));
  // }

  @action
  batchUpdate({ default_pool_id, data }) {
    const body = {};
    body[this.listResponseKey] = data;
    return this.submitting(
      request.put(`${this.getListUrl()}/${default_pool_id}/members`, body)
    );
  }

  @action
  update({ default_pool_id, member_id, data }) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(
      request.put(
        `${this.getListUrl()}/${default_pool_id}/members/${member_id}`,
        body
      )
    );
  }

  @action
  delete = ({ id, default_pool_id }) =>
    this.submitting(
      request.delete(`${this.getListUrl()}/${default_pool_id}/members/${id}`)
    );
}

const globalPoolMemberStore = new PoolMemberStore();

export default globalPoolMemberStore;
