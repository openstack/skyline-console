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
import {
  novaBase,
  skylineBase,
  neutronBase,
  glanceBase,
} from 'utils/constants';
import { get } from 'lodash';
import Base from '../base';
import { RecycleBinStore } from '../skyline/recycle-server';

export class ServerStore extends Base {
  @observable
  interface = {};

  @observable
  securityGroups = {};

  @observable
  interfaces = [];

  @observable
  serverSnapshots = [];

  get module() {
    return 'servers';
  }

  get apiVersion() {
    return novaBase();
  }

  get responseKey() {
    return 'server';
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

  getListUrl = () => `${this.apiVersion}/${this.module}`;

  getListPageUrl = () => `${skylineBase()}/extension/servers`;

  getListDetailUrl = () => `${skylineBase()}/extension/servers`;

  getDetailUrl = ({ id }) => `${this.apiVersion}/${this.module}/${id}`;

  get paramsFuncPage() {
    return (params) => {
      const { current, ...rest } = params;
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
    const result = await request.get(
      this.getDetailUrl({ id }),
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
          all_projects,
        });
        item.itemInList = result[0];
      } else {
        const store = new RecycleBinStore();
        const result = await store.fetchList({ uuid: id, all_projects });
        item.itemInList = result[0];
      }
    } catch (e) {}
    return item;
  }

  async requestList(url, params, filters) {
    const { members, isServerGroup } = filters;
    if (members && isServerGroup && members.length === 0) {
      return [];
    }
    const datas = !this.fetchListByLimit
      ? await this.requestListAll(url, params)
      : await this.requestListAllByLimit(url, params, 100);
    return datas;
  }

  async listDidFetch(newData, allProjects, filters) {
    if (newData.length === 0) {
      return newData;
    }
    const { members, isServerGroup, host } = filters;
    const isoImages = await request.get(
      `${glanceBase()}/images?disk_format=iso`
    );
    const { images } = isoImages;
    if (images[0]) {
      const imageId = images.map((it) => it.id);
      newData.map((server) => {
        if (imageId.indexOf(server.image) !== -1) {
          server.iso_server = true;
        }
        return server;
      });
    }
    if (isServerGroup) {
      return newData.filter((it) => members.indexOf(it.id) >= 0);
    }
    if (host) {
      return newData.filter((it) => it.host === host);
    }
    return newData;
  }

  @action
  async fetchInterface({ id }) {
    this.interface.isLoading = true;
    const params = { device_id: id };
    const resData = await request.get(`${neutronBase()}/ports`, params);
    const networks = await request.get(`${neutronBase()}/networks?`);
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
    const portResult = await request.get(`${neutronBase()}/ports`, {
      device_id: id,
    });
    const { ports = [] } = portResult;
    const sgs = [];
    ports.forEach((it) => sgs.push(...it.security_groups));
    const sgIds = Array.from(new Set(sgs));
    let sgItems = [];
    try {
      const result = await Promise.all(
        sgIds.map((it) => request.get(`${neutronBase()}/security-groups/${it}`))
      );
      sgItems = result.map((it) => it.security_group);
    } catch (e) {}
    this.securityGroups = {
      data: sgItems || [],
      interfaces: ports,
      isLoading: false,
    };
  }

  @action
  delete = async ({ id }) => {
    return this.submitting(request.delete(this.getDetailUrl({ id })));
  };

  @action
  async create(body) {
    return this.submitting(request.post(this.getListUrl(), body));
  }

  @action
  async getConsole({ id }) {
    const body = {
      remote_console: {
        protocol: 'vnc',
        type: 'novnc',
      },
    };
    const result = await request.post(
      `${this.getListUrl()}/${id}/remote-consoles`,
      body
    );
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
    const result = await request.post(
      `${this.getListUrl()}/${id}/remote-consoles`,
      body
    );
    this.isSubmitting = false;
    return result;
  }

  @action
  async operation({ body, id, key }, sleepTime) {
    // set timeout to delay to fresh
    let reqBody = body;
    if (!reqBody) {
      reqBody = {};
      reqBody[key] = null;
    }
    return this.update({ id }, reqBody, sleepTime);
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
  async forceDelete({ id }, expiredTime) {
    if (!expiredTime) {
      return this.operation({ key: 'forceDelete', id });
    }
    const body = {
      forceDelete: null,
    };
    return request.post(`${this.getDetailUrl({ id })}/action`, body);
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
        adminPass: password,
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
  async liveResize({ id, flavor }) {
    const body = {
      liveResize: {
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
    const url = `${this.getListUrl()}/${id}/os-interface`;
    return this.submitting(request.post(url, body));
  }

  @action
  async fetchInterfaceList({ id }) {
    const url = `${this.getListUrl()}/${id}/os-interface`;
    const result = await request.get(url);
    this.interfaces = result.interfaceAttachments;
    return result.interfaceAttachments;
  }

  @action
  async detachInterface({ id, ports }) {
    return this.submitting(
      Promise.all(
        ports.map((port) => {
          const url = `${this.getListUrl()}/${id}/os-interface/${port}`;
          return request.delete(url);
        })
      )
    );
  }

  @action
  async attachVolume({ id, body }) {
    const url = `${this.getListUrl()}/${id}/os-volume_attachments`;
    return this.submitting(request.post(url, body));
  }

  @action
  async detachVolume({ id, volumes }) {
    return this.submitting(
      Promise.all(
        volumes.map((item) => {
          const url = `${this.getListUrl()}/${id}/os-volume_attachments/${item}`;
          return request.delete(url);
        })
      )
    );
  }
}

const globalServerStore = new ServerStore();
export default globalServerStore;
