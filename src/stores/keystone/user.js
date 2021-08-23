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
import request from 'utils/request';
import { keystoneBase } from 'utils/constants';
import { get } from 'lodash';
import Base from '../base';
import globalProjectStore from './project';
import globalGroupStore from './user-group';

export class UserStore extends Base {
  @observable
  domains = [];

  @observable
  roleAssignments = [];

  @observable
  projects = [];

  @observable
  systemRoles = [];

  @observable
  domainRoles = [];

  get module() {
    return 'users';
  }

  get apiVersion() {
    return keystoneBase();
  }

  get responseKey() {
    return 'user';
  }

  @action
  async create(values) {
    const body = {};
    const {
      select_project = [],
      select_user_group = [],
      newProjectRoles,
      defaultRole,
      ...other
    } = values;
    const data = other;
    body[this.responseKey] = data;
    this.isSubmitting = true;
    const result = await request.post(this.getListUrl(), body);
    const {
      user: { id: user_id },
    } = result;
    // if (default_project_id) {
    //   const url = `${this.apiVersion}/projects/${default_project_id}/users/${user_id}/roles/${adminId}`;
    //   await request.put(url);
    // }
    const promiseList = [];
    if (select_user_group[0] || select_project[0]) {
      const newProjects = Object.keys(newProjectRoles);
      select_user_group.forEach((id) => {
        promiseList.push(globalGroupStore.addGroupUsers({ id, user_id }));
      });
      select_project.forEach((id) => {
        if (!newProjects.includes(id)) {
          const role_id = defaultRole;
          promiseList.push(
            globalProjectStore.assignUserRole({ id, user_id, role_id })
          );
        } else {
          promiseList.push(
            globalProjectStore.assignUserRole({
              id,
              user_id,
              role_id: newProjectRoles[id],
            })
          );
        }
      });
      await Promise.all(promiseList);
    }
    this.isSubmitting = false;
    return result;
  }

  @action
  async fetchDomain() {
    const doaminsResult = await request.get(`${this.apiVersion}/domains`);
    this.domains = doaminsResult.domains;
  }

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
  getUserProjectRole = (user, roleAssignment, projectMapRole) => {
    if (roleAssignment.user) {
      const {
        user: { id: user_id },
        role: { id: role_id },
        scope: { project: { id } = {} } = {},
      } = roleAssignment;
      if (id && user_id === user.id) {
        if (projectMapRole[id]) {
          projectMapRole[id].push(role_id);
        } else {
          projectMapRole[id] = [role_id];
        }
      }
    }
  };

  @action
  async fetchList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    const [roleAssignmentsReault, usersResult, roleResult] = await Promise.all([
      request.get(`${this.apiVersion}/role_assignments`),
      request.get(`${this.apiVersion}/users`),
      request.get(`${this.apiVersion}/roles`),
    ]);
    const { users } = usersResult;
    const { roles } = roleResult;
    const systemRoles = roles.filter(
      (it) =>
        (it.name.includes('system_') && !it.name.includes('_system_')) ||
        it.name === 'admin'
    );
    const systemRoleId = systemRoles.map((it) => it.id);
    users.map((user) => {
      const projectMapRole = {}; // { project_id: [roles_id] }
      const projectMapSystemRole = {}; // { project_id: [systemRoles_id] }
      roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
        this.getUserProjectRole(user, roleAssignment, projectMapRole);
      });
      this.getUsersSystemRole(
        projectMapRole,
        systemRoleId,
        projectMapSystemRole
      );
      user.projects = projectMapRole;
      user.projectMapSystemRole = projectMapSystemRole;
      user.project_num = Object.keys(projectMapRole).length;
      return users;
    });
    const newData = users.map(this.mapper);
    this.list.update({
      data: newData,
      total: newData.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return newData;
  }

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const [roleAssignmentsReault, usersResult, roleResult] = await Promise.all([
      request.get(`${this.apiVersion}/role_assignments`),
      request.get(`${this.apiVersion}/users/${id}`),
      request.get(`${this.apiVersion}/roles`),
    ]);
    const { roles } = roleResult;
    const systemRoles = roles.filter(
      (it) =>
        (it.name.includes('system_') && !it.name.includes('_system_')) ||
        it.name === 'admin'
    );
    const systemRoleId = systemRoles.map((it) => it.id);
    const { user } = usersResult;
    const projectMapRole = {};
    const projectMapSystemRole = {};
    roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
      this.getUserProjectRole(user, roleAssignment, projectMapRole);
    });
    this.getUsersSystemRole(projectMapRole, systemRoleId, projectMapSystemRole);
    user.projects = projectMapRole;
    user.projectMapSystemRole = projectMapSystemRole;
    user.project_num = Object.keys(projectMapRole).length;
    this.detail = user;
    this.isLoading = false;
    return user;
  }

  @action
  async pureFetchDetail({ id, silent }) {
    return super.fetchDetail({ id, silent });
  }

  @action
  getUsersSystemRole = (projectMapRole, systemRoleId, projectMapSystemRole) => {
    const systemProject = Object.keys(projectMapRole);
    systemProject.forEach((project_id) => {
      const roles = projectMapRole[project_id].filter((role_id) =>
        systemRoleId.includes(role_id)
      );
      if (roles[0]) {
        projectMapSystemRole[project_id] = roles;
      }
    });
  };

  @action
  async enable({ id }) {
    const url = `${this.apiVersion}/users/${id}`;
    const reqBody = {
      user: { enabled: true },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async forbidden({ id }) {
    const url = `${this.apiVersion}/users/${id}`;
    const reqBody = {
      user: { enabled: false },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async changePassword({ id, password }) {
    const url = `${this.apiVersion}/users/${id}`;
    const reqBody = {
      user: { password },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async changePasswordUser({ id, password, original_password }) {
    const url = `${this.apiVersion}/users/${id}/password`;
    const reqBody = {
      user: { password, original_password },
    };
    return this.submitting(request.post(url, reqBody));
  }

  @action
  async fetchProject() {
    const projectsResult = await request.get(`${this.apiVersion}/projects`);
    this.projects = projectsResult.projects;
  }

  @action
  async fetchSystemRole({ id, projects }) {
    this.systemRoles = [];
    const project_id = projects[0].id;
    // const rolesResult = await request.get(`${this.apiVersion}/system/users/${id}/roles`);
    const projectResult = await request.get(
      `${this.apiVersion}/projects/${project_id}/users/${id}/roles/`
    );
    const systemRole = projectResult.roles.filter(
      (it) => it.name.includes('system_') && !it.name.includes('_system_')
    );
    this.systemRoles = systemRole;
  }

  @action
  async assignSystemRole({ id, role_id }) {
    const result = request.put(
      `${this.apiVersion}/system/users/${id}/roles/${role_id}`
    );
    return result;
  }

  @action
  async deleteSystemRole({ id, role_id }) {
    const result = request.delete(
      `${this.apiVersion}/system/users/${id}/roles/${role_id}`
    );
    return result;
  }

  @action
  async fetchDomainRole({ id, domain_id }) {
    this.domainRoles = [];
    const rolesResult = await request.get(
      `${this.apiVersion}/domains/${domain_id}/users/${id}/roles`
    );
    this.domainRoles = rolesResult.roles;
  }

  @action
  async assignDomainRole({ id, role_id, domain_id }) {
    const result = request.put(
      `${this.apiVersion}/domains/${domain_id}/users/${id}/roles/${role_id}`
    );
    return result;
  }

  @action
  async deleteDomainRole({ id, role_id, domain_id }) {
    const result = request.delete(
      `${this.apiVersion}/domains/${domain_id}/users/${id}/roles/${role_id}`
    );
    return result;
  }

  @action
  async edit(id, { email, phone, real_name, description, name }) {
    const url = `${this.apiVersion}/users/${id}`;
    const reqBody = {
      user: {
        email,
        phone,
        real_name,
        description,
        name,
      },
    };
    return this.submitting(request.patch(url, reqBody));
  }

  @action
  async fetchListInDomainDetail({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { domainId } = filters;
    const params = {};
    const result = await request.get(this.getListUrl(), params);
    let data = get(result, this.listResponseKey, []);
    data = data.filter((it) => it.domain_id === domainId);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    Promise.all(
      newData.map((it) =>
        request.get(`${this.apiVersion}/users/${it.id}/projects`)
      )
    ).then((projectResult) => {
      newData.map((it, index) => {
        const { projects } = projectResult[index];
        it.projects = projects;
        it.project_num = projects.length;
        return it;
      });
      this.list.update({
        data: newData,
        total: items.length || 0,
        limit: Number(limit) || 10,
        page: Number(page) || 1,
        sortKey,
        sortOrder,
        filters,
        isLoading: false,
        ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      });

      return items;
    });
  }

  @action
  async fetchListInProjectDetail({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { projectId } = filters;
    const params = {};
    const [roleAssignmentsReault, roleResult, result] = await Promise.all([
      request.get(`${this.apiVersion}/role_assignments`),
      request.get(`${this.apiVersion}/roles`),
      request.get(this.getListUrl(), params),
    ]);
    const projectUserIds = [];
    const userMapRole = {};
    roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
      if (roleAssignment.user) {
        const {
          user: { id: user_id },
          role: { id: role_id },
          scope: { project: { id } = {} } = {},
        } = roleAssignment;
        if (id && id === projectId) {
          projectUserIds.push(user_id);
          if (userMapRole[user_id]) {
            userMapRole[user_id].push(role_id);
          } else {
            userMapRole[user_id] = [role_id];
          }
        }
      }
    });
    let data = get(result, this.listResponseKey, []);
    data = data.filter((it) => projectUserIds.includes(it.id));
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    Promise.all(
      newData.map((it) =>
        request.get(`${this.apiVersion}/users/${it.id}/projects`)
      )
    ).then((projectResult) => {
      newData.map((it, index) => {
        const { projects } = projectResult[index];
        it.projects = projects;
        it.project_num = projects.length;
        it.project_roles = userMapRole[it.id].map(
          (r) => roleResult.roles.filter((role) => role.id === r)[0].name
        );
        return it;
      });
      this.list.update({
        data: newData,
        total: items.length || 0,
        limit: Number(limit) || 10,
        page: Number(page) || 1,
        sortKey,
        sortOrder,
        filters,
        isLoading: false,
        ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      });

      return items;
    });
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
    const params = {};
    const result = await request.get(
      `${this.apiVersion}/groups/${groupId}/users`,
      params
    );
    const data = get(result, this.listResponseKey, []);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    Promise.all(
      newData.map((it) =>
        request.get(`${this.apiVersion}/users/${it.id}/projects`)
      )
    ).then((projectResult) => {
      newData.map((it, index) => {
        const { projects } = projectResult[index];
        it.projects = projects;
        it.project_num = projects.length;
        return it;
      });
      this.list.update({
        data: newData,
        total: items.length || 0,
        limit: Number(limit) || 10,
        page: Number(page) || 1,
        sortKey,
        sortOrder,
        filters,
        isLoading: false,
        ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      });

      return items;
    });
  }

  @action
  async fetchListInRoleDetail({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    const { roleId } = filters;
    const params = {};
    const [roleAssignmentsReault, projectResult, result] = await Promise.all([
      request.get(`${this.apiVersion}/role_assignments`),
      request.get(`${this.apiVersion}/projects`),
      request.get(this.getListUrl(), params),
    ]);
    const projectRoleUsers = {};
    const systemRoleUsers = {};
    roleAssignmentsReault.role_assignments.forEach((roleAssignment) => {
      if (roleAssignment.user) {
        const {
          user: { id: user_id },
          role: { id: role_id },
          scope: { project, system } = {},
        } = roleAssignment;
        if (role_id === roleId && project) {
          const projectData = projectResult.projects.find(
            (it) => it.id === project.id
          );
          if (projectRoleUsers[user_id]) {
            projectRoleUsers[user_id].push(projectData.name);
          } else {
            projectRoleUsers[user_id] = [projectData.name];
          }
        } else if (role_id === roleId && system) {
          systemRoleUsers[user_id] = system.all;
        }
      }
    });
    const data = get(result, this.listResponseKey, []);
    const items = data
      .filter((it) => projectRoleUsers[it.id] || systemRoleUsers[it.id])
      .map((it) => ({
        projectScope: projectRoleUsers[it.id] || [],
        systemScope: systemRoleUsers[it.id] || [],
        ...it,
      }));

    const newData = items.map(this.mapper);
    // const newData = await this.listDidFetch(items);
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

    return newData;
  }
}

const globalUserStore = new UserStore();
export default globalUserStore;
