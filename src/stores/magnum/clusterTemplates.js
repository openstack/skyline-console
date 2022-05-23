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
import client from 'client';
import { action } from 'mobx';

export class ClusterTemplatesStore extends Base {
  get client() {
    return client.magnum.clusterTemplates;
  }

  @action
  async create(newbody) {
    return this.submitting(this.client.create(newbody));
  }

  @action
  async delete({ id }) {
    return this.client.delete(id);
  }

  @action
  async get(data) {
    return this.client.get(data);
  }

  @action
  async update({ id }, newbody) {
    return this.client.update(id, newbody);
  }

  async listDidFetch(items) {
    if (!items.length) return items
    return items.map(it => ({ ...it, id: it.uuid }));
  }
}

const globalClusterTemplateStore = new ClusterTemplatesStore();
export default globalClusterTemplateStore;
