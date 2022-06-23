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
import { getGiBValue } from 'utils/index';
import { isNil, isEmpty, isObject } from 'lodash';
import client from 'client';
import Base from 'stores/base';
import globalRootStore from 'stores/root';

export class ProjectStore extends Base {
  @observable
  quota = {};

  @observable
  novaQuota = {};

  @observable
  neutronQuota = {};

  @observable
  groupRoleList = [];

  get client() {
    return client.keystone.projects;
  }

  get domainClient() {
    return client.keystone.domains;
  }

  get roleAssignmentClient() {
    return client.keystone.roleAssignments;
  }

  get roleClient() {
    return client.keystone.roles;
  }

  get userClient() {
    return client.keystone.users;
  }

  get novaQuotaClient() {
    return client.nova.quotaSets;
  }

  get cinderQuotaClient() {
    return client.cinder.quotaSets;
  }

  get neutronQuotaClient() {
    return client.neutron.quotas;
  }

  get shareQuotaClient() {
    return client.manila.quotaSets;
  }

  listFetchByClient(params, originParams) {
    const { userId } = originParams;
    if (userId) {
      return this.userClient.projects.list(userId, params);
    }
    return this.client.list(params);
  }

  get paramsFunc() {
    return (params) => {
      const { id, userId, groupId, withRole, ...rest } = params;
      return rest;
    };
  }

  updateProject = (project, roleAssignments, roles, domains) => {
    const userMapRoles = {};
    const groupMapRoles = {};
    const { id } = project || {};
    roleAssignments.forEach((roleAssignment) => {
      const {
        scope: { project: { id: projectId } = {} } = {},
        user: { id: userId } = {},
        group: { id: groupId } = {},
        role: { id: roleId } = {},
      } = roleAssignment;
      const roleItem = roles.find((it) => it.id === roleId);
      if (projectId === id && roleId) {
        if (userId) {
          userMapRoles[userId] = userMapRoles[userId]
            ? [...userMapRoles[userId], roleItem]
            : [roleItem];
        }
        if (groupId) {
          groupMapRoles[groupId] = groupMapRoles[groupId]
            ? [...groupMapRoles[groupId], roleItem]
            : [roleItem];
        }
      }
    });
    const domain = domains.find((it) => it.id === project.domain_id);
    return {
      ...project,
      users: userMapRoles,
      groups: groupMapRoles,
      userCount: Object.keys(userMapRoles).length,
      groupCount: Object.keys(groupMapRoles).length,
      domain,
      domainName: (domain || {}).name || project.domain_id,
    };
  };

  async listDidFetch(items, allProjects, filters) {
    if (!items.length) {
      return items;
    }
    const { userId, groupId, withRole = true } = filters;
    const params = {};
    if (groupId) {
      params['group.id'] = groupId;
    }
    const [roleAssignmentResult, roleResult, domainResult] = await Promise.all([
      withRole ? this.roleAssignmentClient.list(params) : null,
      withRole ? this.roleClient.list() : null,
      this.domainClient.list(),
    ]);
    const { roles = [] } = roleResult || {};
    const { domains = [] } = domainResult;
    const { role_assignments: assigns = [] } = roleAssignmentResult || {};
    const newItems = items.map((project) => {
      return this.updateProject(project, assigns, roles, domains);
    });
    if (userId) {
      const { groups = [] } = await this.userClient.groups.list(userId);
      return newItems.map((it) => {
        const { users = {}, groups: groupMaps = {} } = it;
        const currentUsers = users[userId] ? { [userId]: users[userId] } : {};
        const groupIds = groups.map((g) => g.id);
        const currentGroups = Object.keys(groupMaps).reduce((pre, cur) => {
          if (groupIds.includes(cur)) {
            pre[cur] = {
              roles: groupMaps[cur],
              group: groups.find((g) => g.id === cur),
            };
          }
          return pre;
        }, {});
        return {
          ...it,
          users: currentUsers,
          userCount: Object.keys(currentUsers).length,
          groups: currentGroups,
          groupCount: Object.keys(currentGroups).length,
        };
      });
    }
    if (groupId) {
      return newItems.filter((it) => !!it.groupCount);
    }
    return newItems;
  }

  async detailDidFetch(item) {
    const { id } = item;
    const [roleAssignmentResult, roleResult, domainResult] = await Promise.all([
      this.roleAssignmentClient.list({
        'scope.project.id': id,
      }),
      this.roleClient.list(),
      this.domainClient.list(),
    ]);
    return this.updateProject(
      item,
      roleAssignmentResult.role_assignments,
      roleResult.roles,
      domainResult.domains
    );
  }

  get enableCinder() {
    return globalRootStore.checkEndpoint('cinder');
  }

  get enableShare() {
    return globalRootStore.checkEndpoint('manilav2');
  }

  @action
  async enable({ id }) {
    const reqBody = {
      project: { enabled: true },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async forbidden({ id }) {
    const reqBody = {
      project: { enabled: false },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async createProject(data) {
    const reqBody = {
      project: data,
    };
    return this.submitting(this.client.create(reqBody));
  }

  @action
  async edit({ id, description, name }) {
    const reqBody = {
      project: { description, name },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async fetchProjectQuota({ project_id }) {
    const promiseArr = [
      this.novaQuotaClient.detail(project_id),
      this.neutronQuotaClient.details(project_id),
    ];
    promiseArr.push(
      this.enableCinder
        ? this.cinderQuotaClient.show(project_id, { usage: 'True' })
        : null
    );
    promiseArr.push(
      this.enableShare ? this.shareQuotaClient.showDetail(project_id) : null
    );
    const [novaResult, neutronResult, cinderResult, shareResult] =
      await Promise.all(promiseArr);
    this.isSubmitting = false;
    const { quota_set: novaQuota } = novaResult;
    const { ram } = novaQuota;
    const { quota_set: cinderQuota = {} } = cinderResult || {};
    const { quota: neutronQuota } = neutronResult;
    const { quota_set: shareQuota = {} } = shareResult || {};
    novaQuota.ram = {
      in_use: getGiBValue(ram.in_use),
      limit: ram.limit === -1 ? ram.limit : getGiBValue(ram.limit),
    };
    const renameShareQuota = Object.keys(shareQuota).reduce((pre, cur) => {
      if (cur === 'gigabytes') {
        pre.share_gigabytes = shareQuota[cur];
      } else {
        pre[cur] = shareQuota[cur];
      }
      return pre;
    }, {});
    const quota = {
      ...novaQuota,
      ...cinderQuota,
      ...neutronQuota,
      ...renameShareQuota,
    };
    const newQuota = this.updateQuotaData(quota);
    this.quota = newQuota;
    return newQuota;
  }

  omitNil = (obj) => {
    return Object.keys(obj).reduce((acc, v) => {
      if (!isNil(obj[v])) {
        acc[v] = obj[v];
      }
      return acc;
    }, {});
  };

  getNovaQuotaBody(data) {
    const {
      instances,
      cores,
      ram,
      server_groups,
      server_group_members,
      key_pairs,
    } = data;
    let ramGb = ram;
    if (ram && ram !== -1) {
      ramGb = ram * 1024;
    }
    const novaReqBody = {
      quota_set: this.omitNil({
        instances,
        cores,
        ram: ramGb,
        server_groups,
        server_group_members,
        key_pairs,
      }),
    };
    return novaReqBody;
  }

  getCinderQuotaBody(data) {
    if (!this.enableCinder) return {};
    const { backups, ...others } = data;
    const rest = {};
    Object.keys(others).forEach((key) => {
      if (
        (key.includes('volumes') ||
          key.includes('gigabytes') ||
          key.includes('snapshots')) &&
        !key.includes('share')
      ) {
        rest[key] = others[key];
      }
    });
    const cinderReqBody = {
      quota_set: this.omitNil({
        backups,
        ...rest,
      }),
    };
    return cinderReqBody;
  }

  getNeutronQuotaBody(data) {
    const {
      security_group_rule,
      network,
      router,
      subnet,
      floatingip,
      security_group,
      port,
    } = data;
    const neutronReqBody = {
      quota: this.omitNil({
        network,
        router,
        subnet,
        floatingip,
        security_group,
        security_group_rule,
        port,
      }),
    };
    return neutronReqBody;
  }

  getShareQuotaBody(data) {
    if (!this.enableShare) {
      return {};
    }
    const { shares, share_gigabytes, share_networks, share_groups } = data;
    const shareReqBody = {
      quota_set: this.omitNil({
        shares,
        gigabytes: share_gigabytes,
        share_networks,
        share_groups,
      }),
    };
    return shareReqBody;
  }

  async updateQuota(project_id, data) {
    const novaReqBody = this.getNovaQuotaBody(data);
    const cinderReqBody = this.getCinderQuotaBody(data);
    const neutronReqBody = this.getNeutronQuotaBody(data);
    const shareReqBody = this.getShareQuotaBody(data);
    const reqs = [];
    if (!isEmpty(novaReqBody.quota_set)) {
      reqs.push(client.nova.quotaSets.update(project_id, novaReqBody));
    }
    if (!isEmpty(cinderReqBody.quota_set)) {
      reqs.push(client.cinder.quotaSets.update(project_id, cinderReqBody));
    }
    if (!isEmpty(neutronReqBody.quota)) {
      reqs.push(client.neutron.quotas.update(project_id, neutronReqBody));
    }
    if (!isEmpty(shareReqBody.quota_set)) {
      reqs.push(client.manila.quotaSets.update(project_id, shareReqBody));
    }
    const result = await Promise.all(reqs);
    return result;
  }

  @action
  async updateProjectQuota({ project_id, data }) {
    this.isSubmitting = true;
    const result = await this.updateQuota(project_id, data);
    this.isSubmitting = false;
    return result;
  }

  @action
  async create(data) {
    const body = {};
    body[this.responseKey] = data;
    this.isSubmitting = true;
    const result = await this.client.create(body);
    this.isSubmitting = false;
    return result;
  }

  @action
  async assignUserRole({ id, userId, roleId }) {
    const result = await this.client.users.roles.update(id, userId, roleId);
    return result;
  }

  @action
  async removeUserRole({ id, userId, roleId }) {
    const result = await this.client.users.roles.delete(id, userId, roleId);
    return result;
  }

  @action
  async getGroupRoleList({ id, groupId }) {
    const result = await this.client.groups.roles.list(id, groupId);
    this.groupRoleList = result.roles;
  }

  @action
  async assignGroupRole({ id, groupId, roleId }) {
    const result = await this.client.groups.roles.update(id, groupId, roleId);
    return result;
  }

  async removeGroupRole({ id, groupId, roleId }) {
    const result = await this.client.groups.roles.delete(id, groupId, roleId);
    return result;
  }

  getLeftQuotaData = (data) => {
    const { used = 0, limit = 0, reserved = 0 } = data;
    if (limit === -1) {
      return -1;
    }
    return limit - used - reserved;
  };

  updateQuotaData = (quota) => {
    const newData = JSON.parse(JSON.stringify(quota));
    Object.keys(newData).forEach((it) => {
      if (isObject(newData[it])) {
        if (newData[it].in_use !== undefined) {
          newData[it].used = newData[it].in_use;
        }
        newData[it].left = this.getLeftQuotaData(newData[it]);
      }
    });
    return newData;
  };

  @action
  async fetchProjectNovaQuota() {
    const result = await this.novaQuotaClient.detail(this.currentProjectId);
    const { quota_set: quota } = result;
    const novaQuota = this.updateQuotaData(quota);
    this.novaQuota = novaQuota;
    return novaQuota;
  }

  @action
  async fetchProjectNeutronQuota(projectId) {
    const result = await this.neutronQuotaClient.details(
      projectId || this.currentProjectId
    );
    const { quota } = result;
    const neutronQuota = this.updateQuotaData(quota);
    this.neutronQuota = neutronQuota;
    return neutronQuota;
  }
}

const globalProjectStore = new ProjectStore();
export default globalProjectStore;
