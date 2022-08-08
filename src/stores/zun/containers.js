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
import { isEmpty } from 'lodash';

export class ContainersStore extends Base {
  get client() {
    return client.zun.containers;
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
  async start({ id }) {
    return this.client.start(id);
  }

  @action
  async stop({ id }) {
    return this.client.stop(id);
  }

  @action
  async pause({ id }) {
    return this.client.pause(id);
  }

  @action
  async reboot({ id }) {
    return this.client.reboot(id);
  }

  @action
  async unpause({ id }) {
    return this.client.unpause(id);
  }

  @action
  async rebuild(id, data) {
    return this.client.rebuild(id, data);
  }

  @action
  async kill(id, data) {
    return this.client.kill(id, data);
  }

  @action
  async forceDelete({ id }) {
    return this.client.delete(id, null, { force: true });
  }

  @action
  async execute(id, data) {
    return this.client.execute(id, data);
  }

  async detailDidFetch(item) {
    const { uuid, status, addresses = {} } = item;
    let stats = {};
    if (status === 'Running') {
      stats = (await this.client.stats.list(uuid)) || {};
    }
    const networks = Object.keys(addresses);
    let { ports = [] } = item;
    if (isEmpty(ports)) {
      ports = Object.values(addresses)
        .reduce((ret, cur) => {
          ret = ret.concat(cur);
          return ret;
        }, [])
        .map((it) => it.port);
    }
    return { ...item, stats, networks, ports };
  }

  async fetchLogs(id) {
    const logs = await this.client.logs.list(id);
    return logs;
  }
}

const globalContainersStore = new ContainersStore();
export default globalContainersStore;
