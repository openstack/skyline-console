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

export class SecretsStore extends Base {
  get client() {
    return client.barbican.secrets;
  }

  get payloadClient() {
    return client.barbican.secrets.payload;
  }

  get fetchListByLimit() {
    return true;
  }

  get paramsFunc() {
    return (params) => ({
      ...params,
    });
  }

  updateMarkerParams = (limit, offset) => ({
    limit,
    offset,
  });

  get mapper() {
    return (data) => {
      const { secret_ref } = data;
      const [, uuid] = secret_ref.split('/secrets/');
      return {
        ...data,
        id: uuid,
      };
    };
  }

  async requestListAllByLimit(params, limit) {
    let hasNext = true;
    let data = [];
    while (hasNext) {
      const offset = data.length || '';
      // eslint-disable-next-line no-await-in-loop
      const result = await this.requestListByMarker(params, limit, offset);
      const items = this.getListDataFromResult(result);
      data = [...data, ...items];
      if (limit >= result.total || offset >= result.total) {
        hasNext = false;
      }
    }
    return data;
  }

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const [item, payload] = await Promise.all([
      this.client.show(id, {}, { headers: { Accept: 'application/json' } }),
      this.payloadClient.list(id, {}, { headers: { Accept: 'text/plain' } }),
    ]);
    item.payload = payload;
    const detail = this.mapper(item || {});
    this.detail = detail;
    this.isLoading = false;
    return detail;
  }

  @action
  async create(data) {
    return this.client.create(data);
  }
}

const globalSecretsStore = new SecretsStore();
export default globalSecretsStore;
