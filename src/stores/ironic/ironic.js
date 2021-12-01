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

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class IronicStore extends Base {
  @observable
  bootDevice = null;

  @observable
  supportedBootDevices = [];

  @observable
  traits = [];

  get client() {
    return client.ironic.nodes;
  }

  get portClient() {
    return client.ironic.ports;
  }

  get traitClient() {
    return client.placement.traits;
  }

  get listWithDetail() {
    return true;
  }

  async detailDidFetch(item, all_projects, params) {
    if (params.onlyDetail) {
      return item;
    }
    const { uuid: id } = item;
    const newItem = { ...item };
    const [bootDevice, states, validate, ports] = await Promise.all([
      this.getBootDevice(id),
      this.client.states.list(id),
      this.client.validate.list(id),
      this.client.ports.list(id),
    ]);
    newItem.bootDevice = bootDevice;
    newItem.states = states;
    newItem.validate = validate;
    newItem.portsNew = ports.ports;
    return newItem;
  }

  async listDidFetch(items) {
    if (items.length === 0) {
      return items;
    }
    const result = await this.portClient.listDetail();
    const { ports } = result;
    items.forEach((it) => {
      const nodePorts = ports.filter((port) => port.node_uuid === it.uuid);
      it.portCount = nodePorts.length;
    });
    return items;
  }

  @action
  changeProvision(id, body) {
    return this.submitting(this.client.updateStatesProvision(id, body));
  }

  @action
  changePower(id, body) {
    return this.submitting(this.client.UpdateStatesPower(id, body));
  }

  @action
  setMaintenance(id, body) {
    return this.submitting(this.client.updateMaintenance(id, body));
  }

  @action
  clearMaintenance(id) {
    return this.submitting(this.client.deleteMaintenance(id));
  }

  @action
  async getBootDevice(id) {
    try {
      const result = await this.submitting(
        this.client.getManagementBootDevice(id)
      );
      this.bootDevice = result;
      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      return null;
    }
  }

  @action
  async getSupportedBootDevice(id) {
    const result = await this.submitting(
      this.client.getManagementBootDeviceSupported(id)
    );
    this.supportedBootDevices = result.supported_boot_devices || [];
    return this.supportedBootDevices;
  }

  @action
  setBootDevice(id, body) {
    return this.submitting(this.client.updateManagementBootDevice(id, body));
  }

  @action
  async create(body) {
    const { traits = [], ...rest } = body;
    if (traits.length === 0) {
      return this.submitting(this.client.create(rest));
    }
    this.isLoading = true;
    const result = await this.client.create(rest);
    const { uuid } = result;
    return this.updateTraits(uuid, traits);
  }

  @action
  edit({ id }, body) {
    return this.submitting(this.client.patch(id, body));
  }

  @action
  async getTraits() {
    const result = await this.traitClient.list();
    const { traits = [] } = result;
    traits.sort();
    this.traits = traits;
  }

  @action
  updateTraits(id, traits) {
    const body = {
      traits,
    };
    return this.submitting(this.client.updateTraits(id, body));
  }
}

const globalIronicStore = new IronicStore();
export default globalIronicStore;
