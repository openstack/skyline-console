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
import { isBoolean } from 'lodash';

export class ClusterTemplatesStore extends Base {
  get client() {
    return client.magnum.clusterTemplates;
  }

  @action
  async create(newbody) {
    return this.submitting(this.client.create(newbody));
  }

  @action
  async delete({ id }) {
    return this.client.delete(id);
  }

  @action
  async update({ id }, body) {
    const newBody = Object.keys(body)
      .filter(
        (key) =>
          !(
            ['network_driver', 'external_network_id'].includes(key) &&
            !body[key]
          )
      )
      .map((key) => ({
        path: `/${key}`,
        value:
          key === 'labels'
            ? JSON.stringify(body[key] || {})
            : isBoolean(body[key])
            ? `${body[key]}`
            : body[key],
        op: [null, undefined, ''].includes(body[key]) ? 'remove' : 'replace',
      }));
    return this.submitting(this.client.patch(id, newBody));
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.uuid,
    });
  }

  async listDidFetch(items) {
    if (!items.length) return items;
    const { keypairs = [] } = (await client.nova.keypairs.list()) || {};
    return items.map((it) => {
      const keypair = keypairs.find((k) => k?.keypair?.name === it.keypair_id);
      if (keypair) {
        it.selfKeypair = true;
      }
      return it;
    });
  }

  async detailDidFetch(item) {
    const { keypairs = [] } = (await client.nova.keypairs.list()) || {};
    const keypair = keypairs.find((k) => k?.keypair?.name === item.keypair_id);
    if (keypair) {
      item.selfKeypair = true;
    }
    return item;
  }
}

const globalClusterTemplateStore = new ClusterTemplatesStore();
export default globalClusterTemplateStore;
