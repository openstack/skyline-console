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
import { getQueryString } from 'utils/index';
import { getLocalTime } from 'utils/time';
import { setLocalStorageItem } from 'utils/local-storage';
import { skylineBase } from 'utils/constants';
import { isEmpty, isArray } from 'lodash';
import checkPolicy, { onlyAdminCanReadPolicy } from 'resources/policy';
// global stores need to be clear data when change auth
import globalFloatingIpsStore from './neutron/floatingIp';
import globalImageStore from './glance/image';
import globalServerStore from './nova/instance';
import globalKeypairStore from './nova/keypair';
import globalNetworkStore from './neutron/network';
import globalPortForwardingStore from './neutron/port-forwarding';
import globalQoSPolicyStore from './neutron/qos-policy';
import globalRecycleBinStore from './skyline/recycle-server';
import globalSecurityGroupStore from './neutron/security-group';
import globalSecurityGroupRuleStore from './neutron/security-rule';
import globalServerGroupStore from './nova/server-group';
import globalSnapshotStore from './cinder/snapshot';
import globalStaticRouteStore from './neutron/static-route';
import globalSubnetStore from './neutron/subnet';
import globalVirtualAdapterStore from './neutron/virtual-adapter';
import globalVolumeStore from './cinder/volume';
import globalComputeHostStore from './nova/compute-host';
import globalHypervisorStore from './nova/hypervisor';
import globalStackStore from './heat/stack';

class RootStore {
  @observable
  user = null;

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
  objectStorageAuth = {};

  @observable
  version = '';

  @observable
  noticeCount = 0;

  getUrl = (key) => `${skylineBase()}/${key}`;

  // @observable
  // menu = renderMenu(i18n.t);

  constructor() {
    this.routing = new RouterStore();
    this.routing.query = this.query;

    global.navigateTo = this.routing.push;
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
    await request.post(this.getUrl('login'), params);
    return this.getUserProfileAndPolicy();
  }

  @action
  updateUserRoles(user) {
    const { roles = [], base_roles = [], base_domains } = user || {};
    this.roles = roles;
    this.baseRoles = base_roles;
    this.baseDomains = base_domains;
    // const adminRole = roles.find(it => it.name === 'admin');
    this.hasAdminRole = checkPolicy(onlyAdminCanReadPolicy);
    globals.user.hasAdminRole = this.hasAdminRole;
  }

  @action
  updateUser(user, policies) {
    globals.user = user;
    globals.policies = policies;
    this.user = user;
    this.policies = policies;
    const {
      keystone_token,
      keystone_token_exp,
      endpoints = {},
      license = {},
      version = '',
    } = user || {};
    this.license = license || {};
    this.version = version;
    this.updateUserRoles(user);
    const exp = getLocalTime(keystone_token_exp).valueOf();
    setLocalStorageItem('keystone_token', keystone_token, 0, exp);
    this.endpoints = endpoints;
  }

  @action
  async getUserPolices() {
    const result = await request.get(this.getUrl('policies'));
    this.policies = result.policies;
  }

  @action
  async checkPolicy(rules) {
    const body = {
      rules: isArray(rules) ? rules : [rules],
    };
    const result = await request.post(
      this.getUrl(`${skylineBase()}/policies/check`),
      body
    );
    const allowedFalse = result.policies.find((it) => !it.allowed);
    return !allowedFalse;
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
      request.get(this.getUrl('profile')),
      request.get(this.getUrl('policies')),
    ]);
    this.updateUser(profile, policies.policies || []);
  }

  @action
  async getObjectStorageAuth() {
    if (!isEmpty(this.objectStorageAuth)) {
      return this.objectStorageAuth;
    }
    const url = this.getUrl('object_store/credentials');
    const result = await request.post(url);
    const { aws_access_key, aws_secret_key } = result;
    const auth = {
      'Aws-Access-Key': aws_access_key,
      'Aws-Secret-Key': aws_secret_key,
    };
    this.objectStorageAuth = auth;
    return auth;
  }

  @action
  async logout() {
    await request.post(this.getUrl('logout'));
    this.clearData();
    globals.user = null;
    globals.policies = [];
    this.user = null;
    this.policies = [];
    this.roles = [];
    this.hasAdminRole = false;
    this.license = null;
    this.version = '';
    this.noticeCount = 0;
    this.gotoLoginPage();
  }

  @action
  gotoLoginPage(currentPath, refresh) {
    if (currentPath) {
      this.routing.push(`/user/login?referer=${currentPath}`);
    } else {
      this.routing.push('/user/login');
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
    this.objectStorageAuth = {};
    const url = this.getUrl(
      `switch_project/${projectId}?project_domain_id=${domainId}`
    );
    const body = {
      project_id: projectId,
      project_domain_id: domainId,
    };
    await request.post(url, body);
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
    const url = this.getUrl('contrib/keystone_endpoints');
    const res = await request.get(url);
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
    const stores = [
      globalFloatingIpsStore,
      globalImageStore,
      globalServerStore,
      globalKeypairStore,
      globalNetworkStore,
      globalPortForwardingStore,
      globalQoSPolicyStore,
      globalRecycleBinStore,
      globalSecurityGroupStore,
      globalSecurityGroupRuleStore,
      globalServerGroupStore,
      globalSnapshotStore,
      globalStaticRouteStore,
      globalSubnetStore,
      globalVirtualAdapterStore,
      globalVolumeStore,
      globalComputeHostStore,
      globalHypervisorStore,
      globalStackStore,
    ];
    stores.forEach((store) => {
      store.clearData();
    });
  }
}

const globalRootStore = new RootStore();
export default globalRootStore;
