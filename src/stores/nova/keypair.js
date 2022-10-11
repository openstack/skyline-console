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

export class KeypairStore extends Base {
  @observable
  createdItem = null;

  get client() {
    return client.nova.keypairs;
  }

  get fetchListByLimit() {
    return true;
  }

  get markerKey() {
    return 'keypair.name';
  }

  get mapper() {
    return (data) => {
      const { keypair } = data;
      const item = keypair ? { ...keypair } : data;
      item.origin_id = item.id;
      item.id = item.name;
      return item;
    };
  }

  @action
  async create(data) {
    const body = {};
    body[this.responseKey] = data;
    this.createdItem = data;
    return this.submitting(this.client.create(body));
  }
}

const globalKeypairStore = new KeypairStore();
export default globalKeypairStore;
