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

export class QosSpecKeyStore extends Base {
  get client() {
    return client.cinder.qosSpecs;
  }

  listFetchByClient(params) {
    const { id } = params;
    return this.client.show(id);
  }

  getListDataFromResult = (result) => {
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
    return data;
  };

  @action
  createOrUpdate(id, data) {
    const body = {};
    body.qos_specs = data;
    return this.submitting(this.client.update(id, body));
  }

  // TODO
  @action
  delete = ({ id, keyname }) =>
    this.submitting(
      this.client.deleteKeys(id, {
        keys: [keyname],
      })
    );
}

const globalQosSpecKeyStore = new QosSpecKeyStore();
export default globalQosSpecKeyStore;
