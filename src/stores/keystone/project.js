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
import { getGBValue } from 'utils/index';
import { get, isNil, isEmpty } from 'lodash';
import client from 'client';
import Base from 'stores/base';

export class ProjectStore extends Base {
  @observable
  quota = {};

  @observable
  userRoleList = [];

  @observable
  groupRoleList = [];

  @observable
  domains = [];

  @observable
  projectsOnly = [];

  get client() {
    return client.keystone.projects;
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

  async fetchProjects(filters) {
    const { tags } = filters;

    const [roleAssignmentsResult, projectsResult, roleResult] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.client.list(tags ? { tags } : {}),
        this.roleClient.list(),
      ]);
    const { projects } = projectsResult;
    const { roles } = roleResult;
    const projectRoles = roles.filter(
      (it) =>
        (it.name.indexOf('project_') !== -1 &&
          it.name.indexOf('_project_') === -1) ||
        it.name === 'admin'
    );
    const projectRoleId = projectRoles.map((it) => it.id);
    projects.map((project) => {
      const userMapRole = {}; // all user include system role and project role: { user_id: [roles_id] }
      const projectGroups = {};
      const userMapProjectRoles = {}; // { user_id: [projectRoles_id] }
      roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
        this.getUsersAndGroups(
          project,
          roleAssignment,
          userMapRole,
          projectGroups
        );
      });
      this.getUsersProjectRole(userMapRole, userMapProjectRoles, projectRoleId);
      project.users = userMapRole;
      project.userMapProjectRoles = userMapProjectRoles;
      project.groups = projectGroups;
      project.user_num = Object.keys(userMapRole).length;
      project.group_num = Object.keys(projectGroups).length;
      return project;
    });
    return projects;
  }

  @action
  async fetchList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const items = await this.fetchProjects(filters);
    const data = await this.listDidFetch(items, true, filters);
    const newData = data.map(this.mapper);
    this.list.update({
      data: newData,
      total: newData.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return items;
  }

  @action
  getUsersProjectRole = (userMapRole, userMapProjectRoles, projectRoleId) => {
    const projectUser = Object.keys(userMapRole);
    projectUser.forEach((user_id) => {
      const roles = userMapRole[user_id].filter(
        (role_id) => projectRoleId.indexOf(role_id) !== -1
      );
      if (roles[0]) {
        userMapProjectRoles[user_id] = roles;
      }
    });
  };

  @action
  getUsersAndGroups = (project, roleAssignment, userMapRole, projectGroups) => {
    if (roleAssignment.user) {
      const {
        user: { id: user_id },
        role: { id: role_id },
        scope: { project: { id } = {} } = {},
      } = roleAssignment;
      if (id && id === project.id) {
        if (userMapRole[user_id]) {
          userMapRole[user_id].push(role_id);
        } else {
          userMapRole[user_id] = [role_id];
        }
      }
    }
    if (roleAssignment.group) {
      const {
        group: { id: group_id },
        role: { id: role_id },
        scope: { project: { id } = {} } = {},
      } = roleAssignment;
      if (id && id === project.id) {
        if (projectGroups[group_id]) {
          projectGroups[group_id].push(role_id);
        } else {
          projectGroups[group_id] = [role_id];
        }
      }
    }
  };

  get mapper() {
    return (item) => {
      const domain = this.domains.filter((it) => it.id === item.domain_id);
      if (domain[0]) {
        item.domain_name = domain[0].name;
      }
      return item;
    };
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
  async fetchDomain() {
    const domainsResult = await this.skylineClient.domains();
    this.domains = domainsResult.domains;
  }

  @action
  async createProject(data) {
    const reqBody = {
      project: data,
    };
    return this.submitting(this.client.create(reqBody));
  }

  async fetchProject(id) {
    const [roleAssignmentsResult, projectResult, roleResult] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.client.show(id),
        this.roleClient.list(),
      ]);
    const { roles } = roleResult;
    const projectRoles = roles.filter(
      (it) =>
        (it.name.indexOf('project_') !== -1 &&
          it.name.indexOf('_project_') === -1) ||
        it.name === 'admin'
    );
    const projectRoleId = projectRoles.map((it) => it.id);
    const { project } = projectResult;
    const userMapRole = {};
    const projectGroups = {};
    const userMapProjectRoles = {};
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
      this.getUsersAndGroups(
        project,
        roleAssignment,
        userMapRole,
        projectGroups
      );
    });
    this.getUsersProjectRole(userMapRole, userMapProjectRoles, projectRoleId);
    project.users = userMapRole;
    project.userMapProjectRoles = userMapProjectRoles;
    project.groups = projectGroups;
    project.user_num = Object.keys(userMapRole).length;
    project.group_num = Object.keys(projectGroups).length;
    const newItem = await this.detailDidFetch(project);
    return newItem;
  }

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const item = await this.fetchProject(id);
    const detail = this.mapper(item);
    this.detail = detail;
    this.isLoading = false;
    return detail;
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
    const [novaResult, cinderResult, neutronResult] = await Promise.all([
      this.novaQuotaClient.detail(project_id),
      this.cinderQuotaClient.show(project_id, { usage: 'True' }),
      this.neutronQuotaClient.details(project_id),
    ]);
    this.isSubmitting = false;
    const { quota_set: novaQuota } = novaResult;
    const { ram } = novaQuota;
    const { quota_set: cinderQuota } = cinderResult;
    const { quota: neutronQuota } = neutronResult;
    novaQuota.ram = {
      in_use: getGBValue(ram.in_use),
      limit: ram.limit === -1 ? ram.limit : getGBValue(ram.limit),
    };
    const quota = { ...novaQuota, ...cinderQuota, ...neutronQuota };
    const quotaKey = Object.keys(quota);
    quotaKey.forEach((it) => {
      if (quota[it].in_use !== undefined) {
        quota[it].used = quota[it].in_use;
      }
    });
    this.quota = quota;
    return quota;
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
    const { backups, ...others } = data;
    const rest = {};
    Object.keys(others).forEach((key) => {
      if (
        key.includes('volumes') ||
        key.includes('gigabytes') ||
        key.includes('snapshots')
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

  async updateQuota(project_id, data) {
    const novaReqBody = this.getNovaQuotaBody(data);
    const cinderReqBody = this.getCinderQuotaBody(data);
    const neutronReqBody = this.getNeutronQuotaBody(data);
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
  async getUserRoleList({ id, user_id }) {
    const result = await this.client.users.roles.list(id, user_id);
    this.userRoleList = result.roles;
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
  async assignUserRole({ id, user_id, role_id }) {
    const result = await this.client.users.roles.update(id, user_id, role_id);
    return result;
  }

  @action
  async removeUserRole({ id, user_id, role_id }) {
    const result = await this.client.users.roles.delete(id, user_id, role_id);
    return result;
  }

  @action
  async getGroupRoleList({ id, group_id }) {
    const result = await this.client.groups.roles.list(id, group_id);
    this.groupRoleList = result.roles;
  }

  @action
  async assignGroupRole({ id, group_id, role_id }) {
    const result = await this.client.groups.roles.update(id, group_id, role_id);
    return result;
  }

  async removeGroupRole({ id, group_id, role_id }) {
    const result = await this.client.groups.roles.delete(id, group_id, role_id);
    return result;
  }

  @action
  async fetchListInUserDetail({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { userId } = filters;
    const [roleAssignmentsResult, projectsResult, roleResult, groupResult] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.userClient.projects.list(userId),
        this.roleClient.list(),
        this.userClient.groups.list(userId),
      ]);
    const projects = get(projectsResult, this.listResponseKey, []);
    projects.map((project) => {
      const userMapRole = {};
      const projectGroups = {};
      roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
        this.getUsersAndGroups(
          project,
          roleAssignment,
          userMapRole,
          projectGroups
        );
      });
      project.users = userMapRole;
      project.groups = projectGroups;
      project.projectRole = [];
      if (userMapRole[userId]) {
        project.projectRole = userMapRole[userId].map(
          (it) => roleResult.roles.filter((role) => role.id === it)[0].name
        );
      }
      groupResult.groups.forEach((group) => {
        if (projectGroups[group.id]) {
          project.groupProjectRole = projectGroups[group.id].map(
            (it) =>
              `${roleResult.roles.filter((role) => role.id === it)[0].name}(${t(
                'user group'
              )}: ${group.name})`
          );
        }
      });
      project.user_num = Object.keys(userMapRole).length;
      project.group_num = Object.keys(projectGroups).length;
      return project;
    });

    this.list.update({
      data: projects,
      total: projects.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return projects;
  }

  @action
  async fetchListInGroupDetail({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { groupId } = filters;
    const [roleAssignmentsResult, projectsResult, roleResult] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.client.list(),
        this.roleClient.list(),
      ]);
    const projects = get(projectsResult, this.listResponseKey, []);
    projects.map((project) => {
      const userMapRole = {};
      const projectGroups = {};
      roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
        this.getUsersAndGroups(
          project,
          roleAssignment,
          userMapRole,
          projectGroups
        );
      });
      project.users = userMapRole;
      project.groups = projectGroups;
      project.projectRole = [];
      if (projectGroups[groupId]) {
        project.projectRole = projectGroups[groupId].map(
          (it) => roleResult.roles.filter((role) => role.id === it)[0].name
        );
      }
      project.user_num = Object.keys(userMapRole).length;
      project.group_num = Object.keys(projectGroups).length;
      return project;
    });

    const groupProjects = projects.filter(
      (it) => Object.keys(it.groups).indexOf(groupId) >= 0
    );
    this.list.update({
      data: groupProjects,
      total: groupProjects.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return groupProjects;
  }

  @action
  async fetchProjectListOnly() {
    this.list.isLoading = true;
    const result = await this.client.list();
    this.projectsOnly = get(result, this.listResponseKey, []);
    this.list.isLoading = false;
    return result;
  }
}

const globalProjectStore = new ProjectStore();
export default globalProjectStore;
