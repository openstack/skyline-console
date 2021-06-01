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
import request from 'utils/request';
import {
  keystoneBase,
  novaBase,
  cinderBase,
  neutronBase,
} from 'utils/constants';
import { get } from 'lodash';
import Base from '../base';

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

  getResourceUrl = () => keystoneBase();

  get module() {
    return 'projects';
  }

  get apiVersion() {
    return keystoneBase();
  }

  get responseKey() {
    return 'project';
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
    // todo: no page, no limit, fetch all
    // const params = { ...filters };

    const [roleAssignmentsReault, projectsResult, roleResult] =
      await Promise.all([
        request.get(`${this.apiVersion}/role_assignments`),
        request.get(`${this.apiVersion}/projects`),
        request.get(`${this.apiVersion}/roles`),
      ]);
    const { projects } = projectsResult;
    const { roles } = roleResult;
    const projectRoleId = roles.map((it) => it.id);
    projects.map((project) => {
      const userMapRole = {}; // all user include system role and project role: { user_id: [roles_id] }
      const projectGroups = {};
      const userMapProjectRoles = {}; // { user_id: [projectRoles_id] }
      roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
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
    const items = projects.map(this.mapper);
    const newData = await this.listDidFetch(items);
    this.list.update({
      data: newData,
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
    const url = `${this.apiVersion}/projects/${id}`;
    const reqBody = {
      project: { enabled: true },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async forbidden({ id }) {
    const url = `${this.apiVersion}/projects/${id}`;
    const reqBody = {
      project: { enabled: false },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async fetchDomain() {
    const doaminsResult = await request.get(`${this.getResourceUrl()}/domains`);
    this.domains = doaminsResult.domains;
  }

  @action
  async createProject(data) {
    const reqBody = {
      project: data,
    };
    return this.submitting(
      request.post(`${this.getResourceUrl()}/projects`, reqBody)
    );
  }

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const [roleAssignmentsReault, projectResult, roleResult] =
      await Promise.all([
        request.get(`${this.apiVersion}/role_assignments`),
        request.get(`${this.apiVersion}/projects/${id}`),
        request.get(`${this.apiVersion}/roles`),
      ]);
    const { roles } = roleResult;
    const projectRoleId = roles.map((it) => it.id);
    const { project } = projectResult;
    const userMapRole = {};
    const projectGroups = {};
    const userMapProjectRoles = {};
    roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
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
    this.detail = project;
    this.isLoading = false;
    return project;
  }

  @action
  async edit({ id, description, name }) {
    const url = `${this.apiVersion}/projects/${id}`;
    const reqBody = {
      project: { description, name },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async fetchProjectQuota({ project_id }) {
    const [novaResult, cinderResult, neutronResult] = await Promise.all([
      request.get(`${novaBase()}/os-quota-sets/${project_id}/detail`),
      request.get(
        `${cinderBase()}/${
          globals.user.project.id
        }/os-quota-sets/${project_id}?usage=True`
      ),
      request.get(`${neutronBase()}/quotas/${project_id}/details`),
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
  }

  @action
  async updateProjectQuota({ project_id, data }) {
    this.isSubmitting = true;
    const {
      instances,
      cores,
      ram,
      volumes,
      gigabytes,
      security_group_rule,
      server_groups,
      snapshots,
      backups,
      backup_gigabytes,
      network,
      router,
      subnet,
      floatingip,
      security_group,
      port,
      server_group_members,
      key_pairs,
      ...others
    } = data;
    let ramGb = ram;
    if (ram !== -1) {
      ramGb = ram * 1024;
    }
    const novaReqBody = {
      quota_set: {
        instances,
        cores,
        ram: ramGb,
        server_groups,
        server_group_members,
        key_pairs,
      },
    };
    const cinderReqBody = {
      quota_set: {
        volumes,
        gigabytes,
        backup_gigabytes,
        snapshots,
        backups,
        ...others,
      },
    };
    const neutronReqBody = {
      quota: {
        network,
        router,
        subnet,
        floatingip,
        security_group,
        security_group_rule,
        port,
      },
    };
    const result = await Promise.all([
      request.put(`${novaBase()}/os-quota-sets/${project_id}`, novaReqBody),
      request.put(
        `${cinderBase()}/${
          globals.user.project.id
        }/os-quota-sets/${project_id}`,
        cinderReqBody
      ),
      request.put(`${neutronBase()}/quotas/${project_id}`, neutronReqBody),
    ]);
    this.isSubmitting = false;
    return result;
  }

  @action
  async getUserRoleList({ id, user_id }) {
    const url = `${this.apiVersion}/projects/${id}/users/${user_id}/roles/`;
    this.isSubmitting = true;
    const result = await request.get(url);
    this.userRoleList = result.roles;
  }

  @action
  async create(data) {
    const body = {};
    body[this.responseKey] = data;
    this.isSubmitting = true;
    const result = await request.post(this.getListUrl(), body);
    this.isSubmitting = false;
    return result;
  }

  @action
  async assignUserRole({ id, user_id, role_id }) {
    const url = `${this.apiVersion}/projects/${id}/users/${user_id}/roles/${role_id}`;
    const result = request.put(url);
    return result;
  }

  @action
  async removeUserRole({ id, user_id, role_id }) {
    const url = `${this.apiVersion}/projects/${id}/users/${user_id}/roles/${role_id}`;
    const result = request.delete(url);
    return result;
  }

  @action
  async getGroupRoleList({ id, group_id }) {
    const url = `${this.apiVersion}/projects/${id}/groups/${group_id}/roles/`;
    this.isSubmitting = true;
    const result = await request.get(url);
    this.groupRoleList = result.roles;
  }

  @action
  async assignGroupRole({ id, group_id, role_id }) {
    const url = `${this.apiVersion}/projects/${id}/groups/${group_id}/roles/${role_id}`;
    const result = request.put(url);
    return result;
  }

  async removeGroupRole({ id, group_id, role_id }) {
    const url = `${this.apiVersion}/projects/${id}/groups/${group_id}/roles/${role_id}`;
    const result = request.delete(url);
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
    const [roleAssignmentsReault, projectsResult, roleResult, groupResult] =
      await Promise.all([
        request.get(`${this.apiVersion}/role_assignments`),
        request.get(`${this.apiVersion}/users/${userId}/projects`),
        request.get(`${this.apiVersion}/roles`),
        request.get(`${this.apiVersion}/users/${userId}/groups`),
      ]);
    const projects = get(projectsResult, this.listResponseKey, []);
    projects.map((project) => {
      const userMapRole = {};
      const projectGroups = {};
      roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
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
          // const id = 3;
          project.groupProjectRole = projectGroups[group.id].map(
            (it) =>
              `${roleResult.roles.filter((role) => role.id === it)[0].name}(${t(
                'user group'
              )}: ${group.name})`
          );
        }
      });
      // const { id } = project;
      // this.getUserRoleList({ id, user_id: userId });
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
    const [roleAssignmentsReault, projectsResult, roleResult] =
      await Promise.all([
        request.get(`${this.apiVersion}/role_assignments`),
        request.get(`${this.apiVersion}/projects`),
        request.get(`${this.apiVersion}/roles`),
      ]);
    const projects = get(projectsResult, this.listResponseKey, []);
    projects.map((project) => {
      const userMapRole = {};
      const projectGroups = {};
      roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
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
    const result = await request.get(`${this.apiVersion}/${this.module}`);
    this.projectsOnly = get(result, this.listResponseKey, []);
  }
}

const globalProjectStore = new ProjectStore();
export default globalProjectStore;
