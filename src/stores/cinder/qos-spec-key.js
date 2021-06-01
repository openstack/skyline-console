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
import { cinderBase } from 'utils/constants';
import Base from '../base';

export class QosSpecKeyStore extends Base {
  get module() {
    if (!globals.user) {
      return null;
    }
    return `${globals.user.project.id}/qos-specs`;
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'qos_specs';
  }

  getListUrl = ({ id }) => `${this.apiVersion}/${this.module}/${id}`;

  @action
  async fetchList({
    id,
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    const params = { ...filters };

    const result = await request.get(this.getListUrl({ id }), params);
    const { specs = {} } = result.qos_specs || {};
    const data = [];
    Object.keys(specs).forEach((key) => {
      data.push({
        id: key,
        keyname: key,
        name: key,
        value: specs[key],
      });
    });
    const items = data.map(this.mapper);

    this.list.update({
      data,
      total: items.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    this.urlId = id;
    return data;
  }

  @action
  createOrUpdate(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(request.put(this.getListUrl({ id }), body));
  }

  // TODO
  @action
  delete = ({ id, keyname }) =>
    this.submitting(
      request.put(`${this.getListUrl({ id })}/delete_keys`, {
        keys: [keyname],
      })
    );
}

const globalQosSpecKeyStore = new QosSpecKeyStore();
export default globalQosSpecKeyStore;
