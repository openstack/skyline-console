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
import { getLocalTime } from 'utils/time';
import { setLocalStorageItem } from 'utils/local-storage';
import { isEmpty, values } from 'lodash';

const checkItemPolicy = require('resources/policy').default;
const { onlyAdminCanReadPolicy } = require('resources/policy');

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
  baseRoles = [];

  @observable
  baseDomains = [];

  @observable
  policies = [];

  @observable
  hasAdminRole = false;

  @observable
  hasAdminPageRole = false;

  @observable
  openKeys = [];

  @observable
  endpoints = {};

  @observable
  oldPassword = {};

  @observable
  license = null;

  @observable
  info = {};

  @observable
  version = '';

  @observable
  noticeCount = 0;

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

  @action
  async login(params) {
    await this.client.login(params);
    return this.getUserProfileAndPolicy();
  }

  checkAdminRole(roles) {
    if (checkItemPolicy({ policy: onlyAdminCanReadPolicy })) {
      return true;
    }
    const regex = /^[\w-_]*(system_admin|system_reader)$/;
    return roles.some((role) => regex.test(role.name));
  }

  @action
  updateUserRoles(user) {
    const { roles = [], base_roles = [], base_domains } = user || {};
    this.roles = roles;
    this.baseRoles = base_roles;
    this.baseDomains = base_domains;
    // TODO: fix system/project admin/member/reader for W
    this.hasAdminRole = checkItemPolicy({ policy: onlyAdminCanReadPolicy });
    this.hasAdminPageRole = this.checkAdminRole(roles);
  }

  @action
  updateUser(user, policies) {
    this.user = user;
    this.policies = policies;
    const {
      keystone_token,
      keystone_token_exp,
      endpoints = {},
      license = {},
      version = '',
      project: { id: projectId, name: projectName } = {},
    } = user || {};
    this.projectId = projectId;
    this.projectName = projectName;
    this.license = license || {};
    this.version = version;
    this.updateUserRoles(user);
    const exp = getLocalTime(keystone_token_exp).valueOf();
    setLocalStorageItem('keystone_token', keystone_token, 0, exp);
    this.endpoints = endpoints;
  }

  @action
  async getUserPolices() {
    const result = await this.client.policies.list();
    this.policies = result.policies;
  }

  checkLicense(key) {
    if (!key) {
      return true;
    }
    const { features = [] } = this.license || {};
    const addonItem = features.find((it) => !!it.addons) || {};
    const { addons: addonStr = '' } = addonItem || {};
    const addons = addonStr.split(';');
    return addons.indexOf(key) >= 0;
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
    this.updateUser(profile, policies.policies || []);
    this.getNeutronExtensions();
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
    this.license = null;
    this.version = '';
    this.noticeCount = 0;
    this.gotoLoginPage();
  }

  @action
  gotoLoginPage(currentPath, refresh) {
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
    await this.client.switchProject(projectId, domainId);
    // this.updateUser(result);
    this.clearData();
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
    this.noticeCount -= 1;
  }

  @action
  clearNoticeCount() {
    this.noticeCount = 0;
  }

  clearData() {
    // global stores need to be clear data when change auth
    const allGlobalStores = require('./index').default;
    const stores = values(allGlobalStores);
    stores.forEach((store) => {
      store.clearData();
    });
  }
}

const globalRootStore = new RootStore();
export default globalRootStore;
