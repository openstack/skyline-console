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

export class ExtraSpecStore extends Base {
  get module() {
    if (!globals.user) {
      return null;
    }
    return `${globals.user.project.id}/types`;
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'extra_spec';
  }

  getExtraSpecsUrl = ({ id }) =>
    `${this.apiVersion}/${this.module}/${id}/extra_specs`;

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

    const result = await request.get(this.getExtraSpecsUrl({ id }), params);
    const { extra_specs } = result;
    const data = [];
    Object.keys(extra_specs).forEach((key) => {
      data.push({
        id: key,
        keyname: key,
        name: key,
        value: extra_specs[key],
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
    const body = {
      extra_specs: data,
    };
    return this.submitting(request.post(this.getExtraSpecsUrl({ id }), body));
  }

  @action
  delete = ({ id, keyname }) => {
    return this.submitting(
      request.delete(`${this.getExtraSpecsUrl({ id })}/${keyname}`)
    );
  };
}
const globalExtraSpecStore = new ExtraSpecStore();
export default globalExtraSpecStore;
