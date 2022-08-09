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
import { action, observable } from 'mobx';
import globalFlavorStore from 'stores/nova/flavor';
import { get as _get } from 'lodash';

export class InstancesStore extends Base {
  @observable
  dataList = [];

  get client() {
    return client.trove.instances;
  }

  get clientDatastore() {
    return client.trove.datastores;
  }

  get clientConfigurationGroup() {
    return client.trove.configurations;
  }

  get adminClient() {
    return client.trove.instancesAdmin;
  }

  get mapper() {
    return (data) => ({
      ...data,
      type: _get(data, 'datastore.type'),
      version: _get(data, 'datastore.version'),
      size: _get(data, 'volume.size'),
    });
  }

  async detailDidFetch(item) {
    const flavor = await globalFlavorStore.fetchDetail({
      id: _get(item, 'flavor.id'),
    });
    return {
      ...item,
      flavor: { ...item.flavor, ...flavor },
    };
  }

  listDidFetch(items) {
    if (items.length === 0) return items;
    return items.map((it) => ({
      ...it,
      project_id: it.tenant_id,
    }));
  }

  @action
  async create(newbody) {
    return this.submitting(this.client.create(newbody));
  }

  @action
  async delete({ params }, newbody) {
    return this.client.delete(params, newbody);
  }

  @action
  update(id, body) {
    return this.submitting(this.client.action(id, body));
  }

  @action
  async operation({ body, id, key = '' }) {
    let requestBody = body;
    if (!requestBody) {
      requestBody = {};
      requestBody[key] = {};
    }
    return this.update(id, requestBody);
  }

  @action
  async restart({ id }) {
    return this.operation({ key: 'restart', id });
  }

  @action
  async reboot({ id }) {
    return this.operation({ key: 'reboot', id });
  }

  @action
  async stop({ id }) {
    return this.submitting(this.adminClient.action(id, { stop: {} }));
  }

  @action
  async resizeVolume({ id, size }) {
    const body = {
      resize: {
        volume: { size },
      },
    };
    return this.operation({ body, id });
  }

  @action
  async listDatastores() {
    const result = await this.clientDatastore.list();
    const data = result.datastores;
    this.dataList = data.map(this.mapper);
  }

  @action
  async fetchListWithoutDetail() {
    const result = await this.client.list();
    const data = result[this.listResponseKey];
    this.list.data = data.map(this.mapper);
  }

  @action
  async listConfigurationGroup() {
    const result = await this.clientConfigurationGroup.list();
    const data = result.configurations;
    this.list.data = data.map(this.mapper);
  }
}

const globalInstancesStore = new InstancesStore();
export default globalInstancesStore;
