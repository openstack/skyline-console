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

import { action } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class PoolMemberStore extends Base {
  get client() {
    return this.poolClient.members;
  }

  get poolClient() {
    return client.octavia.pools;
  }

  get responseKey() {
    return 'member';
  }

  get listFilterByProject() {
    return true;
  }

  listFetchByClient(params, originParams) {
    const { pool_id } = originParams;
    return this.client.list(pool_id);
  }

  @action
  create({ default_pool_id, data }) {
    const body = {};
    body[this.listResponseKey] = data;
    return this.submitting(this.client.create(default_pool_id, body));
  }

  @action
  batchUpdate({ default_pool_id, data }) {
    const body = {};
    body[this.listResponseKey] = data;
    return this.submitting(
      this.poolClient.batchUpdateMembers(default_pool_id, body)
    );
  }

  @action
  update({ default_pool_id, member_id, data }) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(
      this.client.update(default_pool_id, member_id, body)
    );
  }

  @action
  delete = ({ id, default_pool_id }) =>
    this.submitting(this.client.delete(default_pool_id, id));
}

const globalPoolMemberStore = new PoolMemberStore();

export default globalPoolMemberStore;
