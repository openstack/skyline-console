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

export class ExtraSpecStore extends Base {
  get client() {
    return client.manila.types.extraSpecs;
  }

  get isSubResource() {
    return true;
  }

  getFatherResourceId = (params) => params.id;

  getListDataFromResult = (result) => {
    const { extra_specs } = result;
    const data = [];
    Object.keys(extra_specs).forEach((key) => {
      data.push({
        id: key,
        keyName: key,
        name: key,
        value: extra_specs[key],
      });
    });
    return data;
  };

  @action
  createOrUpdate(id, data) {
    const body = {
      extra_specs: data,
    };
    return this.submitting(this.client.create(id, body));
  }

  @action
  delete = ({ id, keyName }) => {
    return this.submitting(this.client.delete(id, keyName));
  };
}
const globalExtraSpecStore = new ExtraSpecStore();
export default globalExtraSpecStore;
