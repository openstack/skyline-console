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
import { get } from 'lodash';
import client from 'client';
import Base from 'stores/base';
import { mapperRule } from 'resources/neutron/security-group-rule';
import { RecycleBinStore } from '../skyline/recycle-server';
import { hashPasswordForCloudInit } from 'src/resources/nova/instance';

export class ServerStore extends Base {
  @observable
  interface = {};

  @observable
  securityGroups = {};

  @observable
  interfaces = [];

  @observable
  serverSnapshots = [];

  @observable
  volumesForSnapshot = [];

  get client() {
    return client.nova.servers;
  }

  get imageClient() {
    return client.glance.images;
  }

  get portClient() {
    return client.neutron.ports;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get sgClient() {
    return client.neutron.securityGroups;
  }

  get mapper() {
    return (item) => {
      item.status = item.status.toLowerCase();
      if (!item.flavor_info) {
        item.flavor_info = item.flavor;
      }
      return item;
    };
  }

  get mapperSecurityGroupRule() {
    return (data) => {
      const { security_group_rules = [] } = data;
      return {
        ...data,
        security_group_rules: security_group_rules.map(mapperRule),
      };
    };
  }

  listFetchByClient(params) {
    return this.skylineClient.extension.servers(params);
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, noReminder, ...rest } = params;
      return rest;
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  @action
  async fetchDetailWithoutExpiration({ id, all_projects }) {
    this.isLoading = true;
    const result = await this.client.show(
      id,
      this.getDetailParams({ all_projects })
    );
    const originData = get(result, this.responseKey) || result;
    this.detail = this.mapperBeforeFetchProject(originData);
    this.isLoading = false;
    return this.detail;
  }

  async detailDidFetch(item, all_projects, filters) {
    const { id } = item;
    const { isRecycleBinDetail } = filters;
    try {
      if (!isRecycleBinDetail) {
        const result = await this.fetchList({
          uuid: id,
          noReminder: true,
          all_projects,
        });
        item.itemInList = result.find((it) => it.id === id);
      } else {
        const store = new RecycleBinStore();
        const result = await store.fetchList({
          uuid: id,
          all_projects,
        });
        item.itemInList = result.find((it) => it.id === id);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return item;
  }

  async requestList(params, originParams = {}) {
    const { members, isServerGroup } = originParams;
    if (members && isServerGroup && members.length === 0) {
      return [];
    }
    const data = !this.fetchListByLimit
      ? await this.requestListAll(params)
      : await this.requestListAllByLimit(params, 100);
    return data;
  }

  async listDidFetch(newData, allProjects, filters) {
    if (newData.length === 0) {
      return newData;
    }
    const { members, isServerGroup, host } = filters;
    const isoImages = await this.imageClient.list({ disk_format: 'iso' });
    const { images } = isoImages;
    if (images[0]) {
      const imageId = images.map((it) => it.id);
      newData.map((server) => {
        if (imageId.indexOf(server.image) !== -1) {
          server.iso_server = true;
        }
        server.tags = (server.origin_data || {}).tags || [];
        return server;
      });
    }
    if (isServerGroup) {
      return newData
        .filter((it) => members.indexOf(it.id) >= 0)
        .map((it) => ({
          ...it,
          tags: (it.origin_data || {}).tags || [],
        }));
    }
    if (host) {
      return newData
        .filter((it) => it.host === host)
        .map((it) => ({
          ...it,
          tags: (it.origin_data || {}).tags || [],
        }));
    }
    return newData.map((it) => ({
      ...it,
      tags: (it.origin_data || {}).tags || [],
    }));
  }

  async fetchLogs(id, tailSize) {
    const logs = await this.client.action(id, {
      'os-getConsoleOutput': {
        length: tailSize,
      },
    });
    return logs;
  }

  @action
  async fetchInterface({ id }) {
    this.interface.isLoading = true;
    const params = { device_id: id };
    const [resData, networks] = await Promise.all([
      this.portClient.list(params),
      this.networkClient.list(),
    ]);
    const interfaces = resData.ports;
    const interfaceAll = [];
    networks.networks.forEach((network) => {
      const interfaceItem = [];
      interfaces.forEach((it) => {
        if (it.network_id === network.id) {
          it.network_name = network.name;
          interfaceItem.push(it);
        }
      });
      if (interfaceItem.length !== 0) {
        interfaceAll.push(interfaceItem);
      }
    });
    this.interface = {
      data: interfaceAll || [],
      total: resData.total_count || resData.length || 0,
      isLoading: false,
    };
  }

  @action
  async fetchSecurityGroup({ id }) {
    this.securityGroups.isLoading = true;
    const portResult = await this.portClient.list({
      device_id: id,
    });
    const { ports = [] } = portResult;
    const sgs = [];
    ports.forEach((it) => sgs.push(...it.security_groups));
    const sgIds = Array.from(new Set(sgs));
    let sgItems = [];
    try {
      const result = await Promise.all(
        sgIds.map((it) => this.sgClient.show(it))
      );
      sgItems = result.map((it) =>
        this.mapperSecurityGroupRule(it.security_group)
      );
    } catch (e) {}
    this.securityGroups = {
      data: sgItems || [],
      interfaces: ports,
      isLoading: false,
    };
  }

  @action
  delete = async ({ id }) => {
    return this.client.delete(id);
  };

  @action
  async create(body) {
    return this.submitting(this.client.create(body));
  }

  @action
  async getConsole({ id }) {
    const body = {
      remote_console: {
        protocol: 'vnc',
        type: 'novnc',
      },
    };
    const result = await this.client.createConsole(id, body);
    this.isSubmitting = false;
    return result;
  }

  @action
  async getConsoleIronic({ id }) {
    const body = {
      remote_console: {
        protocol: 'serial',
        type: 'serial',
      },
    };
    const result = await this.client.createConsole(id, body);
    this.isSubmitting = false;
    return result;
  }

  @action
  update(id, body) {
    return this.submitting(this.client.action(id, body));
  }

  @action
  async operation({ body, id, key }) {
    // set timeout to delay to fresh
    let reqBody = body;
    if (!reqBody) {
      reqBody = {};
      reqBody[key] = null;
    }
    return this.update(id, reqBody);
  }

  @action
  async lock({ id }) {
    return this.operation({ key: 'lock', id });
  }

  @action
  async unlock({ id }) {
    return this.operation({ key: 'unlock', id });
  }

  @action
  async pause({ id }) {
    return this.operation({ key: 'pause', id });
  }

  @action
  async unpause({ id }) {
    return this.operation({ key: 'unpause', id });
  }

  @action
  async suspend({ id }) {
    return this.operation({ key: 'suspend', id });
  }

  @action
  async resume({ id }) {
    return this.operation({ key: 'resume', id });
  }

  @action
  async start({ id }) {
    return this.operation({ key: 'os-start', id });
  }

  @action
  async stop({ id }) {
    return this.operation({ key: 'os-stop', id });
  }

  @action
  async restore({ id }) {
    return this.operation({ key: 'restore', id });
  }

  @action
  async forceDelete({ id }) {
    const body = {
      forceDelete: null,
    };
    return this.client.action(id, body);
  }

  @action
  async rescue(id, rescue) {
    return this.client.action(id, rescue);
  }

  @action
  async unrescue({ id }) {
    const body = {
      unrescue: null,
    };
    return this.operation({ body, id });
  }

  @action
  async softReboot({ id }) {
    const body = {
      reboot: {
        type: 'SOFT',
      },
    };
    return this.operation({ body, id });
  }

  @action
  async reboot({ id }) {
    const body = {
      reboot: {
        type: 'HARD',
      },
    };
    return this.operation({ body, id });
  }

  @action
  async changePassword({ id, password }) {
    const body = {
      changePassword: {
        adminPass: hashPasswordForCloudInit(password),
      },
    };
    return this.operation({ body, id });
  }

  @action
  async createImage({ id, image }) {
    const body = {
      createImage: {
        name: image,
        metadata: {
          usage_type: 'common',
          image_type: 'snapshot',
          instance_id: id,
        },
      },
    };
    return this.operation({ body, id });
  }

  @action
  async rebuild({ id, image }) {
    const body = {
      rebuild: {
        imageRef: image,
      },
    };
    return this.operation({ body, id });
  }

  @action
  async resize({ id, flavor }) {
    const body = {
      resize: {
        flavorRef: flavor,
      },
    };
    return this.operation({ body, id });
  }

  @action
  async migrate({ id, body }) {
    if (body) {
      const newBody = {
        migrate: body,
      };
      return this.operation({ body: newBody, id });
    }
    return this.operation({ key: 'migrate', id });
  }

  @action
  async shelve({ id }) {
    return this.operation({ key: 'shelve', id });
  }

  @action
  async unshelve({ id }) {
    return this.operation({ key: 'unshelve', id });
  }

  @action
  async migrateLive({ id, body }) {
    const newBody = {
      'os-migrateLive': body,
    };
    return this.operation({ body: newBody, id });
  }

  @action
  async removeFloatingIp({ id, body }) {
    const newBody = {
      removeFloatingIp: body,
    };
    return this.operation({ body: newBody, id });
  }

  @action
  async addInterface({ id, body }) {
    return this.submitting(this.client.interfaces.create(id, body));
  }

  @action
  async fetchInterfaceList({ id }) {
    const result = await this.client.interfaces.list(id);
    this.interfaces = result.interfaceAttachments;
    return result.interfaceAttachments;
  }

  @action
  async detachInterface({ id, ports }) {
    return this.submitting(
      Promise.all(ports.map((port) => this.client.interfaces.delete(id, port)))
    );
  }

  @action
  async attachVolume({ id, body }) {
    return this.submitting(this.client.volumeAttachments.create(id, body));
  }

  @action
  async detachVolume({ id, volumes }) {
    return this.submitting(
      Promise.all(
        volumes.map((item) => this.client.volumeAttachments.delete(id, item))
      )
    );
  }

  @action
  setVolumesForSnapshot(volumes) {
    this.volumesForSnapshot = volumes;
  }
}

const globalServerStore = new ServerStore();
export default globalServerStore;
