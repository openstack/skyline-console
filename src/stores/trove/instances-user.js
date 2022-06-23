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

export class InstancesUsersStore extends Base {
  get client() {
    return client.trove.instances.users;
  }

  get databaseClient() {
    return client.trove.instances.databases;
  }

  get instanceClient() {
    return client.trove.instances;
  }

  get isSubResource() {
    return true;
  }

  get responseKey() {
    return 'user';
  }

  get paramsFunc() {
    return (params) => {
      const { id, ...rest } = params;
      return rest;
    };
  }

  async listDidFetch(items, _, filters) {
    if (items.length === 0) return items;
    const { id } = filters;
    const { databases = [] } = await this.databaseClient.list(id);
    return items.map((it) => ({
      ...it,
      databases: (it.databases || [])
        .filter((l1) => databases.find((l2) => l2.name === l1.name))
        .map((db) => db.name),
    }));
  }

  @action
  async create(id, body) {
    return this.submitting(this.client.create(id, body));
  }

  @action
  async deleteUser({ id, name }) {
    return this.submitting(this.client.delete(id, name));
  }

  @action
  async grantDatabaseAccess({ id, name, data }) {
    return this.submitting(this.instanceClient.grantDatabase(id, name, data));
  }
}

const globalInstancesUsersStore = new InstancesUsersStore();
export default globalInstancesUsersStore;
