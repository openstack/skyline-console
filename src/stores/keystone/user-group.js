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
import client from 'client';
import Base from 'stores/base';

export class GroupStore extends Base {
  @observable
  systemRoles = [];

  @observable
  domainRoles = [];

  @observable
  groupUsers = [];

  get client() {
    return client.keystone.groups;
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

  get userClient() {
    return client.keystone.users;
  }

  get projectClient() {
    return client.keystone.projects;
  }

  get paramsFunc() {
    return (params) => {
      const {
        id,
        userId,
        groupId,
        roleId,
        projectId,
        domainId,
        withRole,
        all_projects,
        ...rest
      } = params;
      return rest;
    };
  }

  listFetchByClient(params, originParams) {
    const { userId } = originParams;
    if (userId) {
      return this.userClient.groups.list(userId, params);
    }
    return this.client.list(params);
  }

  @action
  async edit({ id, description, name }) {
    const reqBody = {
      group: { description, name },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async fetchSystemRole({ id }) {
    this.systemRoles = [];
    const rolesResult = await this.systemGroupClient.roles.list(id);
    this.systemRoles = rolesResult.roles;
  }

  @action
  async assignSystemRole({ id, roleId }) {
    return this.systemGroupClient.roles.update(id, roleId);
  }

  @action
  async deleteSystemRole({ id, roleId }) {
    return this.systemGroupClient.roles.delete(id, roleId);
  }

  @action
  async fetchDomainRole({ id, domain_id }) {
    this.domainRoles = [];
    const rolesResult = await this.domainClient.groups.roles.list(
      domain_id,
      id
    );
    this.domainRoles = rolesResult.roles;
  }

  @action
  async assignDomainRole({ id, roleId, domain_id }) {
    return this.domainClient.groups.roles.update(domain_id, id, roleId);
  }

  @action
  async deleteDomainRole({ id, roleId, domain_id }) {
    return this.domainClient.groups.roles.delete(domain_id, id, roleId);
  }

  @action
  async fetchGroupUsers({ id }) {
    const usersResult = await this.client.users.list(id);
    const { users } = usersResult;
    this.groupUsers = users;
    return users;
  }

  @action
  async deleteGroupUsers({ id, userId }) {
    return this.client.users.delete(id, userId);
  }

  @action
  async addGroupUsers({ id, userId }) {
    return this.client.users.update(id, userId);
  }

  updateUserGroup = (group, roleAssignments, roles, domains, projects) => {
    const projectMapRoles = {};
    const { id } = group || {};
    roleAssignments.forEach((roleAssignment) => {
      const {
        scope: { project: { id: projectId } = {} } = {},
        group: { id: groupId } = {},
        role: { id: roleId } = {},
      } = roleAssignment;
      if (groupId === id && roleId) {
        const roleItem = roles.find((it) => it.id === roleId);
        if (projectId) {
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
      }
    });
    const domain = domains.find((it) => it.id === group.domain_id);
    return {
      ...group,
      projects: projectMapRoles,
      projectCount: Object.keys(projectMapRoles).length,
      domain,
      domainName: (domain || {}).name || group.domain_id,
    };
  };

  async listDidFetch(items, allProjects, filters) {
    if (!items.length) {
      return items;
    }
    const { projectId, roleId, domainId, withRole = true } = filters;
    const params = {};
    if (projectId) {
      params['scope.project.id'] = projectId;
    }
    if (roleId) {
      params['role.id'] = roleId;
    }
    const [roleAssignmentResult, roleResult, domainResult, projectsResult] =
      await Promise.all([
        withRole ? this.roleAssignmentClient.list(params) : null,
        withRole ? this.roleClient.list() : null,
        this.domainClient.list(),
        withRole ? this.projectClient.list() : null,
      ]);
    const { roles = [] } = roleResult || {};
    const { domains = [] } = domainResult;
    const { projects = [] } = projectsResult || {};
    const { role_assignments: assigns = [] } = roleAssignmentResult || {};
    let newItems = items;
    if (domainId) {
      newItems = items.filter((it) => it.domain_id === domainId);
    }
    newItems = newItems.map((group) => {
      return this.updateUserGroup(group, assigns, roles, domains, projects);
    });
    if (projectId || roleId) {
      return newItems.filter((it) => it.projectCount);
    }
    return newItems;
  }

  async detailDidFetch(item) {
    const { id } = item;
    const [domainResult, userResult] = await Promise.all([
      this.domainClient.list(),
      this.client.users.list(id),
    ]);
    const { domains = [] } = domainResult;
    const { users = [] } = userResult;
    const newItem = this.updateUserGroup(item, [], [], domains, []);
    newItem.userCount = users.length;
    return newItem;
  }
}

const globalGroupStore = new GroupStore();
export default globalGroupStore;
