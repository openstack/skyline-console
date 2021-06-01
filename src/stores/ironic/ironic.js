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
import { ironicBase, placementBase } from 'utils/constants';
import Base from '../base';

export class IronicStore extends Base {
  @observable
  bootDevice = null;

  @observable
  supportedBootDevices = [];

  @observable
  traits = [];

  get module() {
    return 'nodes';
  }

  get apiVersion() {
    return ironicBase();
  }

  get responseKey() {
    return 'node';
  }

  getListDetailUrl = () => `${this.getListUrl()}/detail`;

  async detailDidFetch(item, all_projects, params) {
    if (params.onlyDetail) {
      return item;
    }
    const { uuid: id } = item;
    const newItem = { ...item };
    const [bootDevice, states, validate, ports] = await Promise.all([
      this.getBootDevice(id),
      request.get(`${this.getDetailUrl({ id })}/states`),
      request.get(`${this.getDetailUrl({ id })}/validate`),
      request.get(`${this.getDetailUrl({ id })}/ports`),
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
    const url = `${this.apiVersion}/ports/detail`;
    const result = await request.get(url);
    const { ports } = result;
    items.forEach((it) => {
      const nodePorts = ports.filter((port) => port.node_uuid === it.uuid);
      it.portCount = nodePorts.length;
    });
    return items;
  }

  @action
  changeProvision(id, body) {
    const url = `${this.getDetailUrl({ id })}/states/provision`;
    return this.submitting(request.put(url, body));
  }

  @action
  changePower(id, body) {
    const url = `${this.getDetailUrl({ id })}/states/power`;
    return this.submitting(request.put(url, body));
  }

  @action
  setMaintenance(id, body) {
    const url = `${this.getDetailUrl({ id })}/maintenance`;
    return this.submitting(request.put(url, body));
  }

  @action
  clearMaintenance(id) {
    const url = `${this.getDetailUrl({ id })}/maintenance`;
    return this.submitting(request.delete(url));
  }

  @action
  async getBootDevice(id) {
    const url = `${this.getDetailUrl({ id })}/management/boot_device`;
    try {
      const result = await this.submitting(request.get(url));
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
    const url = `${this.getDetailUrl({ id })}/management/boot_device/supported`;
    const result = await this.submitting(request.get(url));
    this.supportedBootDevices = result.supported_boot_devices || [];
    return this.supportedBootDevices;
  }

  @action
  setBootDevice(id, body) {
    const url = `${this.getDetailUrl({ id })}/management/boot_device`;
    return this.submitting(request.put(url, body));
  }

  @action
  async create(body) {
    const { traits = [], ...rest } = body;
    if (traits.length === 0) {
      return this.submitting(request.post(this.getListUrl(), rest));
    }
    this.isLoading = true;
    const result = await request.post(this.getListUrl(), rest);
    const { uuid } = result;
    return this.updateTraits(uuid, traits);
  }

  @action
  edit({ id }, body) {
    return this.submitting(request.patch(`${this.getDetailUrl({ id })}`, body));
  }

  @action
  async getTraits() {
    const url = `${placementBase()}/traits`;
    const result = await request.get(url);
    const { traits = [] } = result;
    traits.sort();
    this.traits = traits;
  }

  @action
  updateTraits(id, traits) {
    const url = `${this.getDetailUrl({ id })}/traits`;
    const body = {
      traits,
    };
    return this.submitting(request.put(url, body));
  }
}

const globalIronicStore = new IronicStore();
export default globalIronicStore;
