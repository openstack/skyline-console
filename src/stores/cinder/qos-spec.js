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

const qs = require('qs');

export class QosSpecStore extends Base {
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
    return 'qos_spec';
  }

  @action
  create(data) {
    const body = {};
    const { values } = data;
    body[`${this.responseKey}s`] = values;
    return this.submitting(request.post(this.getListUrl(), body));
  }

  @action
  editConsumer({ id, consumer }) {
    return this.submitting(
      request.put(this.getDetailUrl({ id }), {
        qos_specs: {
          consumer,
        },
      })
    );
  }

  @action
  async updateVolumeTypeQos(id, qos_specs_id, data) {
    if (qos_specs_id) {
      await this.disassociate(qos_specs_id, data);
    }
    if (id) {
      await this.associate(id, data);
    }
    return Promise.resolve();
  }

  @action
  associate(id, data) {
    const query = qs.stringify(data);
    return this.submitting(
      request.get(`${this.getDetailUrl({ id })}/associate?${query}`)
    );
  }

  @action
  disassociate(id, data) {
    const query = qs.stringify(data);
    return this.submitting(
      request.get(`${this.getDetailUrl({ id })}/disassociate?${query}`)
    );
  }
}

const globalQosSpecStore = new QosSpecStore();
export default globalQosSpecStore;
