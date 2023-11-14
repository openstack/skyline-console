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

export class ContainersStore extends Base {
  get client() {
    return client.zun.containers;
  }

  get imageClient() {
    return client.glance.images;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get mapper() {
    return (data) => {
      return {
        ...data,
        id: data.uuid,
        task_state: data.task_state === null ? 'free' : data.task_state,
      };
    };
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

  @action
  async attach(id) {
    return this.client.attach(id);
  }

  @action
  async attachNetwork(id, data) {
    return this.client.network_attach(id, null, data);
  }

  @action
  async detachNetwork(id, data) {
    return this.client.network_detach(id, null, data);
  }

  async listDidFetch(items) {
    if (!items.length) return items;
    const [{ networks: allNetworks }, { subnets: allSubnets }] =
      await Promise.all([this.networkClient.list(), this.subnetClient.list()]);
    return items.map((it) => {
      const { addresses = {} } = it;
      const networks = [];
      const addrs = [];
      const subnets = [];
      Object.entries(addresses).forEach(([key, val]) => {
        (val || []).forEach((v) => {
          const network = allNetworks.find((net) => net.id === key);
          const subnet = allSubnets.find((sub) => sub.id === v.subnet_id);
          addrs.push({ network, addr: v.addr, port: v.port });
          networks.push(network);
          subnets.push(subnet);
        });
      });
      return { ...it, addrs, networks, subnets };
    });
  }

  async detailDidFetch(item) {
    const { uuid, status, image_driver, image, addresses = {} } = item;
    let stats = {};
    if (status === 'Running') {
      stats = (await this.client.stats.list(uuid)) || {};
    }
    if (image_driver === 'glance') {
      try {
        const info = await this.imageClient.show(image);
        item.imageInfo = info;
      } catch (error) {}
    }
    const [{ networks: allNetworks }, { subnets: allSubnets }] =
      await Promise.all([this.networkClient.list(), this.subnetClient.list()]);
    const networks = [];
    const addrs = [];
    const subnets = [];
    Object.entries(addresses).forEach(([key, val]) => {
      (val || []).forEach((v) => {
        const network = allNetworks.find((net) => net.id === key);
        const subnet = allSubnets.find((sub) => sub.id === v.subnet_id);
        addrs.push({ network, addr: v.addr, port: v.port });
        networks.push(network);
        subnets.push(subnet);
      });
    });
    return { ...item, stats, networks, addrs, subnets };
  }

  async fetchLogs(id) {
    const logs = await this.client.logs.list(id);
    return logs;
  }
}

const globalContainersStore = new ContainersStore();
export default globalContainersStore;
