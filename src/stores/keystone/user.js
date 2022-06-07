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
import List from 'stores/base-list';
import client from 'client';
import globalRootStore from 'stores/root';
import globalProjectStore from 'stores/keystone/project';
import globalGroupStore from 'stores/keystone/user-group';
import Base from 'stores/base';

export class UserStore extends Base {
  @observable
  domains = [];

  @observable
  roleAssignments = [];

  @observable
  userProjects = new List();

  @observable
  userGroups = new List();

  @observable
  projects = [];

  @observable
  systemRoles = [];

  @observable
  domainRoles = [];

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

  get systemUserClient() {
    return client.keystone.systemUsers;
  }

  get groupClient() {
    return client.keystone.groups;
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
    const result = await this.client.create(body);
    const {
      user: { id: user_id },
    } = result;
    const promiseList = [];
    if (select_user_group[0] || select_project[0]) {
      const newProjects = Object.keys(newProjectRoles);
      select_user_group.forEach((id) => {
        promiseList.push(
          globalGroupStore.addGroupUsers({ id, userId: user_id })
        );
      });
      select_project.forEach((id) => {
        if (!newProjects.includes(id)) {
          const roleId = defaultRole;
          promiseList.push(
            globalProjectStore.assignUserRole({ id, userId: user_id, roleId })
          );
        } else {
          promiseList.push(
            globalProjectStore.assignUserRole({
              id,
              userId: user_id,
              roleId: newProjectRoles[id],
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
    const domainsResult = await this.domainClient.list();
    this.domains = domainsResult.domains;
  }

  get mapper() {
    return (item) => {
      const domain = this.domains.find((it) => it.id === item.domain_id);
      if (domain) {
        item.domain_name = domain.name;
        item.domainName = domain.name;
      }
      return item;
    };
  }

  @action
  async getUserProjects() {
    this.userProjects.update({
      isLoading: true,
    });
    const {
      user: {
        user: { id },
      },
    } = globalRootStore;
    const { projects } = await this.client.projects.list(id);
    this.userProjects.update({
      data: projects,
      isLoading: false,
    });
    return projects;
  }

  @action
  async getUserGroups() {
    this.userGroups.update({
      isLoading: true,
    });
    const {
      user: {
        user: { id },
      },
    } = globalRootStore;
    const { groups } = await this.client.groups.list(id);
    this.userGroups.update({
      data: groups,
      isLoading: false,
    });
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

  getUserProjectWithRole = (projectMapRole, roles, projects) => {
    return Object.keys(projectMapRole).map((key) => {
      const item = projects.find((it) => it.id === key);
      const roleItems = projectMapRole[key].map((roleId) =>
        roles.find((it) => it.id === roleId)
      );
      item.roles = roleItems;
      return item;
    });
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
    const [roleAssignmentsResult, usersResult, roleResult, projectResult] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.client.list(),
        this.roleClient.list(),
        this.projectClient.list(),
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
      roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
        this.getUserProjectRole(user, roleAssignment, projectMapRole);
      });
      this.getUsersSystemRole(
        projectMapRole,
        systemRoleId,
        projectMapSystemRole
      );
      user.projectItems = this.getUserProjectWithRole(
        projectMapRole,
        roles,
        projectResult.projects
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
    const [roleAssignmentsResult, usersResult, roleResult] = await Promise.all([
      this.roleAssignmentClient.list(),
      this.client.show(id),
      this.roleClient.list(),
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
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
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
  async fetchProject() {
    const projectsResult = await this.projectClient.list();
    this.projects = projectsResult.projects;
  }

  @action
  async fetchSystemRole({ id, projects }) {
    this.systemRoles = [];
    const project_id = projects[0].id;
    const projectResult = await this.projectClient.users.roles.list(
      project_id,
      id
    );
    const systemRole = projectResult.roles.filter(
      (it) => it.name.includes('system_') && !it.name.includes('_system_')
    );
    this.systemRoles = systemRole;
  }

  @action
  async assignSystemRole({ id, role_id }) {
    return this.systemUserClient.roles.update(id, role_id);
  }

  @action
  async deleteSystemRole({ id, role_id }) {
    return this.systemUserClient.delete(id, role_id);
  }

  @action
  async fetchDomainRole({ id, domain_id }) {
    this.domainRoles = [];
    const rolesResult = await this.domainClient.users.roles.list(id, domain_id);
    this.domainRoles = rolesResult.roles;
  }

  @action
  async assignDomainRole({ id, role_id, domain_id }) {
    return this.domainClient.users.roles.update(domain_id, id, role_id);
  }

  @action
  async deleteDomainRole({ id, role_id, domain_id }) {
    return this.domainClient.users.roles.delete(domain_id, id, role_id);
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
    const result = await this.client.list(params);
    let data = get(result, this.listResponseKey, []);
    data = data.filter((it) => it.domain_id === domainId);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    Promise.all(newData.map((it) => this.client.projects.list(it.id))).then(
      (projectResult) => {
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
      }
    );
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
    const [roleAssignmentsResult, roleResult, result] = await Promise.all([
      this.roleAssignmentClient.list(),
      this.roleClient.list(),
      this.client.list(params),
    ]);
    const projectUserIds = [];
    const userMapRole = {};
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
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
    Promise.all(newData.map((it) => this.client.projects.list(it.id))).then(
      (projectResult) => {
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
      }
    );
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
    const result = await this.groupClient.users.list(groupId, params);
    const data = get(result, this.listResponseKey, []);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    Promise.all(newData.map((it) => this.client.projects.list(it.id))).then(
      (projectResult) => {
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
      }
    );
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
    const [roleAssignmentsResult, projectResult, result] = await Promise.all([
      this.roleAssignmentClient.list(),
      this.projectClient.list(),
      this.client.list(params),
    ]);
    const projectRoleUsers = {};
    const systemRoleUsers = {};
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
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
            projectRoleUsers[user_id].push(projectData);
          } else {
            projectRoleUsers[user_id] = [projectData];
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
        projects: projectRoleUsers[it.id] || [],
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

  @action
  async fetchAllWithDomain() {
    this.list.isLoading = true;
    await this.fetchDomain();
    const result = await this.client.list();
    const data = get(result, this.listResponseKey, []);
    const items = data.map(this.mapper);
    const newData = await this.listDidFetch(items);
    this.list.update({
      data: newData,
      total: items.length || 0,
      isLoading: false,
    });

    return items;
  }
}

const globalUserStore = new UserStore();
export default globalUserStore;
