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

export class InstancesDatabasesStore extends Base {
  get client() {
    return client.trove.instances.databases;
  }

  get isSubResource() {
    return true;
  }

  get responseKey() {
    return 'database';
  }

  get paramsFunc() {
    return (params) => {
      const { id, ...rest } = params;
      return rest;
    };
  }

  @action
  async create(id, body) {
    return this.submitting(this.client.create(id, body));
  }

  @action
  async deleteDatabase({ id, name }) {
    return this.submitting(this.client.delete(id, name));
  }
}

const globalInstancesDatabases = new InstancesDatabasesStore();
export default globalInstancesDatabases;
