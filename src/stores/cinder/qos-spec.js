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

export class QosSpecStore extends Base {
  get client() {
    return client.cinder.qosSpecs;
  }

  @action
  create(data) {
    const body = {};
    const { values } = data;
    body[`${this.responseKey}s`] = values;
    return this.submitting(this.client.create(body));
  }

  @action
  editConsumer({ id, consumer }) {
    return this.submitting(
      this.client.update(id, {
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
    return this.submitting(this.client.associate(id, data));
  }

  @action
  disassociate(id, data) {
    return this.submitting(this.client.disassociate(id, data));
  }
}

const globalQosSpecStore = new QosSpecStore();
export default globalQosSpecStore;
