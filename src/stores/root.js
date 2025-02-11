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

import { action, observable, extendObservable } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import { parse } from 'qs';
import client from 'client';
import { getQueryString } from 'utils/index';
import { setLocalStorageItem, clearLocalStorage } from 'utils/local-storage';
import { isEmpty, values } from 'lodash';

export class RootStore {
  @observable
  user = null;

  @observable
  projectId = null;

  @observable
  projectName = null;

  @observable
  roles = [];

  @observable
  baseDomains = [];

  @observable
  policies = [];

  @observable
  hasAdminRole = false;

  @observable
  hasAdminPageRole = false;

  @observable
  hasAdminOnlyRole = false;

  @observable
  openKeys = [];

  @observable
  endpoints = {};

  @observable
  oldPassword = {};

  @observable
  info = {};

  @observable
  version = '';

  @observable
  noticeCount = 0;

  noticeCountWaitRemove = 0;

  @observable
  enableBilling = false;

  @observable
  neutronExtensions = [];

  // @observable
  // menu = renderMenu(i18n.t);

  constructor() {
    this.routing = new RouterStore();
    this.routing.query = this.query;
    global.navigateTo = this.routing.push;
  }

  get client() {
    return client.skyline;
  }

  register(name, store) {
    extendObservable(this, { [name]: store });
  }

  query = (params = {}, refresh = false) => {
    const { pathname, search } = this.routing.location;
    const currentParams = parse(search.slice(1));

    const newParams = refresh ? params : { ...currentParams, ...params };
    this.routing.push(`${pathname}?${getQueryString(newParams)}`);
  };

  setKeystoneToken(result) {
    const { keystone_token } = result || {};
    setLocalStorageItem('keystone_token', keystone_token);
  }

  @action
  async login(params) {
    const result = await this.client.login(params);
    this.setKeystoneToken(result);
    return this.getUserProfileAndPolicy();
  }

  async getUserSystemRoles(user) {
    // only scope system roles has admin/reader can go to administrator
    const { id } = user;
    try {
      const result = await client.keystone.systemUsers.roles.list(id);
      const { roles = [] } = result;
      return roles.some((it) => it.name === 'admin' || it.name === 'reader');
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @action
  async updateUserRoles(user) {
    // eslint-disable-next-line no-unused-vars
    const { roles = [], base_domains, user: userInfo = {} } = user || {};
    this.roles = roles;
    this.baseDomains = base_domains;
    this.hasAdminOnlyRole = roles.some((it) => it.name === 'admin');
    // Prefer allow administrative pages access whenever user owns admin role in certain project
    // this.hasAdminPageRole = await this.getUserSystemRoles(userInfo);
    this.hasAdminPageRole = this.hasAdminOnlyRole;
    this.hasAdminRole = this.hasAdminPageRole;
  }

  @action
  updateUser(user, policies) {
    this.user = user;
    this.policies = policies;
    const {
      endpoints = {},
      version = '',
      project: { id: projectId, name: projectName } = {},
    } = user || {};
    this.projectId = projectId;
    this.projectName = projectName;
    this.version = version;
    this.endpoints = endpoints;
    this.updateUserRoles(user);
    this.setKeystoneToken(user);
  }

  checkEndpoint(key) {
    if (!key) {
      return true;
    }
    return !!this.endpoints[key];
  }

  @action
  async getUserProfileAndPolicy() {
    const [profile, policies] = await Promise.all([
      this.client.profile(),
      this.client.policies.list(),
    ]);
    await this.updateUser(profile, policies.policies || []);
    return this.getNeutronExtensions();
  }

  @action
  async getNeutronExtensions() {
    try {
      const { extensions } = await client.neutron.extensions.list();
      this.neutronExtensions = extensions;
    } catch (error) {
      this.neutronExtensions = [];
    }
  }

  @action
  async logout() {
    await this.client.logout();
    this.clearData();
    this.user = null;
    this.policies = [];
    this.roles = [];
    this.hasAdminRole = false;
    this.hasAdminPageRole = false;
    this.version = '';
    this.noticeCount = 0;
    this.noticeCountWaitRemove = 0;
    this.goToLoginPage();
  }

  @action
  goToLoginPage(currentPath, refresh) {
    if (currentPath) {
      this.routing.push(`/auth/login?referer=${currentPath}`);
    } else {
      this.routing.push('/auth/login');
    }
    if (refresh) {
      window.location.reload();
    }
  }

  @action
  updateOpenKeys(newKeys) {
    this.openKeys = newKeys;
  }

  @action
  async switchProject(projectId, domainId) {
    this.user = null;
    const result = await this.client.switchProject(projectId, domainId);
    this.clearData();
    this.setKeystoneToken(result);
    return this.getUserProfileAndPolicy();
  }

  @action
  async setPasswordInfo(data) {
    this.oldPassword = data;
    if (!data || isEmpty(data)) {
      return;
    }
    const { region } = data;
    const res = await this.client.contrib.keystoneEndpoints();
    const regionInfo = res.find((it) => it.region_name === region);
    const endpoints = {
      keystone: regionInfo.url,
    };
    this.endpoints = endpoints;
  }

  @action
  addNoticeCount() {
    this.noticeCount += 1;
  }

  @action
  removeNoticeCount() {
    const elements = document.getElementsByClassName('ant-modal');
    // if there is an modal in the page, the notice count will be changed later, after no modal.
    if (elements.length > 0) {
      this.noticeCountWaitRemove += 1;
    } else {
      const noticeCount = this.noticeCount - 1 - this.noticeCountWaitRemove;
      this.noticeCount = noticeCount < 0 ? 0 : noticeCount;
      this.noticeCountWaitRemove = 0;
    }
  }

  @action
  clearNoticeCount() {
    this.noticeCount = 0;
    this.noticeCountWaitRemove = 0;
  }

  clearData() {
    // global stores need to be clear data when change auth
    const allGlobalStores = require('./index').default;
    const stores = values(allGlobalStores);
    stores.forEach((store) => {
      store.clearData();
    });
    // clear all local storage expect language
    clearLocalStorage(['lang']);
  }
}

const globalRootStore = new RootStore();
export default globalRootStore;
