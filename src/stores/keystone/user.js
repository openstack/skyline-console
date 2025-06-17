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
import List from 'stores/base-list';
import client from 'client';
import globalProjectStore from 'stores/keystone/project';
import globalGroupStore from 'stores/keystone/user-group';
import Base from 'stores/base';

export class UserStore extends Base {
  @observable
  userProjects = new List();

  get client() {
    return client.keystone.users;
  }

  get domainClient() {
    return client.keystone.domains;
  }

  get systemGroupClient() {
    return client.keystone.systemGroups;
  }

  get roleClient() {
    return client.keystone.roles;
  }

  get roleAssignmentClient() {
    return client.keystone.roleAssignments;
  }

  get projectClient() {
    return client.keystone.projects;
  }

  get authProjectClient() {
    return client.keystone.authProjects;
  }

  get systemUserClient() {
    return client.keystone.systemUsers;
  }

  get groupClient() {
    return client.keystone.groups;
  }

  listFetchByClient(params, originParams) {
    const { groupId } = originParams;
    if (groupId) {
      return this.groupClient.users.list(groupId, params);
    }
    return this.client.list(params);
  }

  get paramsFunc() {
    return (params) => {
      const {
        id,
        projectId,
        groupId,
        roleId,
        withProjectRole,
        withSystemRole,
        all_projects,
        ...rest
      } = params;
      return rest;
    };
  }

  @action
  async create(values) {
    const body = {};
    const {
      select_project,
      select_user_group = [],
      projectRoles,
      defaultRole,
      ...other
    } = values;
    const data = other;
    body[this.responseKey] = data;
    this.isSubmitting = true;
    const result = await this.client.create(body);
    const {
      user: { id: userId },
    } = result;
    const promiseList = [];
    select_user_group.forEach((groupId) => {
      promiseList.push(this.addGroupUsers(groupId, userId));
    });

    Object.keys(projectRoles).forEach((projectId) => {
      const roles = projectRoles[projectId];
      roles.forEach((roleId) => {
        promiseList.push(this.addProjectUser(projectId, userId, roleId));
      });
    });
    await Promise.all(promiseList);
    this.isSubmitting = false;
    return result;
  }

  addGroupUsers = (groupId, userId) => {
    return globalGroupStore.addGroupUsers({ id: groupId, userId });
  };

  addProjectUser = (projectId, userId, roleId) => {
    return globalProjectStore.assignUserRole({ id: projectId, userId, roleId });
  };

  @action
  async getUserProjects() {
    this.userProjects.update({
      isLoading: true,
    });
    const { projects } = await this.authProjectClient.list();
    this.userProjects.update({
      data: projects,
      isLoading: false,
    });
    return projects;
  }

  getUserDefaultProject = (user, projects) => {
    const { default_project_id } = user;
    if (!default_project_id) {
      return;
    }
    const project = projects.find((p) => p.id === default_project_id);
    user.defaultProject = project?.name;
  };

  getProjectMapRoles = (user, projectRoleAssignments, roles, projects) => {
    const projectMapRoles = {};
    const { id } = user;
    projectRoleAssignments.forEach((roleAssignment) => {
      const {
        scope: { project: { id: projectId } = {} } = {},
        role: { id: roleId } = {},
        user: { id: userId } = {},
      } = roleAssignment;
      if (userId === id && roleId && projectId) {
        const roleItem = roles.find((it) => it.id === roleId);
        if (!projectMapRoles[projectId]) {
          const projectItem = projects.find((it) => it.id === projectId);
          projectMapRoles[projectId] = {
            project: projectItem,
            roles: [roleItem],
          };
        } else {
          projectMapRoles[projectId].roles = [
            ...projectMapRoles[projectId].roles,
            roleItem,
          ];
        }
      }
    });
    return projectMapRoles;
  };

  // eslint-disable-next-line no-unused-vars
  getSystemRoles = (user, systemRoleAssignments, roles, projects) => {
    const systemRoles = [];
    const { id } = user || {};
    systemRoleAssignments.forEach((roleAssignment) => {
      const { role: { id: roleId } = {}, user: { id: userId } = {} } =
        roleAssignment;
      if (userId === id && roleId) {
        const roleItem = roles.find((it) => it.id === roleId);
        systemRoles.push(roleItem);
      }
    });
    return systemRoles;
  };

  updateUser = (
    user,
    projectRoleAssignments,
    systemAssigns,
    roles,
    projects,
    domains
  ) => {
    this.getUserDefaultProject(user, projects);
    const projectMapRoles = this.getProjectMapRoles(
      user,
      projectRoleAssignments,
      roles,
      projects
    );
    const systemRoles = this.getSystemRoles(
      user,
      systemAssigns,
      roles,
      projects
    );
    const domain = domains.find((it) => it.id === user.domain_id);
    return {
      ...user,
      projects: projectMapRoles,
      projectCount: Object.keys(projectMapRoles).length,
      domain,
      domainName: (domain || {}).name || user.domain_id,
      systemRoles,
    };
  };

  async listDidFetch(items, allProjects, filters) {
    if (!items.length) {
      return items;
    }
    const {
      withProjectRole = true,
      withDefaultProject = true,
      withSystemRole = true,
      projectId,
      roleId,
      domain_id,
    } = filters;
    const withRole = withProjectRole || withSystemRole;
    const params = {};
    if (roleId) {
      params['role.id'] = roleId;
    }
    if (projectId) {
      params['scope.project.id'] = projectId;
    }
    const reqs = [
      withProjectRole ? this.roleAssignmentClient.list(params) : null,
      withSystemRole
        ? this.roleAssignmentClient.list({ 'scope.system': 'all' })
        : null,
      withRole ? this.roleClient.list() : null,
      withProjectRole || withDefaultProject ? this.projectClient.list() : null,
      domain_id ? null : this.domainClient.list(),
    ];
    const [
      projectRoleAssignmentsResult,
      systemRoleAssignmentsResult,
      roleResult,
      projectResult,
      domainResult,
    ] = await Promise.all(reqs);

    const { roles = [] } = roleResult || {};
    const { domains = [] } = domainResult || {};
    const { role_assignments: assigns = [] } =
      projectRoleAssignmentsResult || {};
    const { role_assignments: systemAssigns = [] } =
      systemRoleAssignmentsResult || {};
    const { projects = [] } = projectResult || {};
    const newItems = items.map((user) => {
      return this.updateUser(
        user,
        assigns,
        systemAssigns,
        roles,
        projects,
        domains
      );
    });
    if (projectId) {
      return newItems.filter((it) => !!it.projectCount);
    }
    if (roleId) {
      return newItems.filter((it) => {
        const { projectCount, systemRoles } = it;
        if (projectCount) {
          return true;
        }
        const systemRole = systemRoles.find((role) => role.id === roleId);
        return !!systemRole;
      });
    }
    return newItems;
  }

  async fetchUserDefaultProject(user) {
    const { default_project_id } = user;
    if (!default_project_id) {
      return null;
    }
    try {
      const { project } = await this.projectClient.show(default_project_id);
      return project;
    } catch (e) {
      return null;
    }
  }

  async detailDidFetch(item) {
    const { id } = item;
    const params = { 'user.id': id, 'scope.system': 'all' };
    const reqs = [
      this.roleAssignmentClient.list(params),
      this.roleClient.list(),
      this.domainClient.list(),
      this.fetchUserDefaultProject(item),
    ];
    const [
      systemRoleAssignmentsResult,
      roleResult,
      domainResult,
      defaultProject,
    ] = await Promise.all(reqs);

    const { roles = [] } = roleResult || {};
    const { domains = [] } = domainResult;
    const { role_assignments: systemAssigns = [] } =
      systemRoleAssignmentsResult || {};
    return this.updateUser(
      item,
      [],
      systemAssigns,
      roles,
      defaultProject ? [defaultProject] : [],
      domains
    );
  }

  @action
  async enable({ id }) {
    const reqBody = {
      user: { enabled: true },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async forbidden({ id }) {
    const reqBody = {
      user: { enabled: false },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async changePassword({ id, password }) {
    const reqBody = {
      user: { password },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async changePasswordUser({ id, password, original_password }) {
    const reqBody = {
      user: { password, original_password },
    };
    return this.submitting(this.client.updatePassword(id, reqBody));
  }

  @action
  async assignSystemRole({ id, roleId }) {
    return this.systemUserClient.roles.update(id, roleId);
  }

  @action
  async deleteSystemRole({ id, roleId }) {
    return this.systemUserClient.roles.delete(id, roleId);
  }

  @action
  async edit(id, { email, phone, real_name, description, name }) {
    const reqBody = {
      user: {
        email,
        phone,
        real_name,
        description,
        name,
      },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async setDefaultProject(id, defaultProject) {
    const reqBody = {
      user: {
        default_project_id: defaultProject,
      },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }
}

const globalUserStore = new UserStore();
export default globalUserStore;
