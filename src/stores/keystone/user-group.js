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
import client from 'client';
import Base from 'stores/base';
import globalProjectStore from 'stores/keystone/project';

export class GroupStore extends Base {
  @observable
  domains = [];

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

  @action
  async create(data, newProjectRoles, defaultRole) {
    const body = {};
    const { select_user, select_project, ...other } = data;

    body[this.responseKey] = other;
    this.isSubmitting = true;
    const result = await this.client.create(body);
    const {
      group: { id: group_id },
    } = result;
    const promiseList = [];
    if (select_user || select_project) {
      const newProjects = Object.keys(newProjectRoles);
      select_user.forEach((user_id) => {
        promiseList.push(this.addGroupUsers({ id: group_id, user_id }));
      });
      select_project.forEach((id) => {
        if (newProjects.indexOf(id) === -1) {
          const role_id = defaultRole;
          promiseList.push(
            globalProjectStore.assignGroupRole({ id, group_id, role_id })
          );
        } else {
          newProjectRoles[id].forEach((role_id) => {
            promiseList.push(
              globalProjectStore.assignGroupRole({ id, group_id, role_id })
            );
          });
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
      const domain = this.domains.filter((it) => it.id === item.domain_id);
      if (domain[0]) {
        item.domain_name = domain[0].name;
      }
      return item;
    };
  }

  @action
  async edit({ id, description, name }) {
    this.isSubmitting = true;
    const reqBody = {
      group: { description, name },
    };
    const result = await this.client.patch(id, reqBody);
    this.isSubmitting = false;
    return result;
  }

  @action
  async fetchSystemRole({ id }) {
    this.systemRoles = [];
    const rolesResult = await this.systemGroupClient.roles.list(id);
    this.systemRoles = rolesResult.roles;
  }

  @action
  async assignSystemRole({ id, role_id }) {
    return this.systemGroupClient.roles.update(id, role_id);
  }

  @action
  async deleteSystemRole({ id, role_id }) {
    return this.systemGroupClient.roles.delete(id, role_id);
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
  async assignDomainRole({ id, role_id, domain_id }) {
    return this.domainClient.groups.roles.update(domain_id, id, role_id);
  }

  @action
  async deleteDomainRole({ id, role_id, domain_id }) {
    return this.domainClient.groups.roles.delete(domain_id, id, role_id);
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
    const [roleAssignmentsResult, result] = await Promise.all([
      this.roleAssignmentClient.list(),
      this.client.list(params),
    ]);
    const projectGroupIds = [];
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
      if (roleAssignment.group) {
        const {
          group: { id: group_id },
          scope: { project: { id } = {} } = {},
        } = roleAssignment;
        if (id && id === projectId) {
          projectGroupIds.push(group_id);
        }
      }
    });
    let data = get(result, this.listResponseKey, []);
    data = data.filter((it) => projectGroupIds.indexOf(it.id) >= 0);
    // const items = data.map(this.mapper);
    // const newData = await this.listDidFetch(items);
    Promise.all(data.map((it) => this.client.users.list(it.id))).then(
      (rest) => {
        const addUserItem = data.map((it, index) => {
          const { users } = rest[index];
          const userIds = users.map((user) => user.id);
          const userInfo = users.map((user) => ({
            id: user.id,
            name: user.name,
          }));
          it.users = userIds;
          it.user_num = users.length;
          it.user_info = userInfo;
          return it;
        });
        const items = addUserItem.map((item) =>
          this.mapperProject(roleAssignmentsResult, item)
        );
        this.list.update({
          data: items,
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
    const params = {};
    const [roleAssignmentsResult, result] = await Promise.all([
      this.roleAssignmentClient.list(),
      this.userClient.groups.list(userId, params),
    ]);
    const projectGroupIds = [];
    roleAssignmentsResult.role_assignments.forEach((roleAssignment) => {
      if (roleAssignment.group) {
        const {
          group: { id: group_id },
          scope: { project: { id } = {} } = {},
        } = roleAssignment;
        if (id && id === userId) {
          projectGroupIds.push(group_id);
        }
      }
    });
    const data = get(result, this.listResponseKey, []);
    const items = data.map((item) =>
      this.mapperProject(roleAssignmentsResult, item)
    );
    this.list.update({
      data: items,
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

  @action
  async fetchGroupUsers({ id }) {
    const usersResult = await this.client.users.list(id);
    const { users: result } = usersResult;
    this.groupUsers = result;
    return result;
  }

  @action
  async deleteGroupUsers({ id, user_id }) {
    return this.client.users.delete(id, user_id);
  }

  @action
  async addGroupUsers({ id, user_id }) {
    return this.client.users.update(id, user_id);
  }

  mapperProject = (roleAssignmentsResult, item) => {
    const projects = roleAssignmentsResult.role_assignments.filter(
      (it) =>
        it.group &&
        it.group.id === item.id &&
        it.scope &&
        it.scope.project &&
        it.scope.project.id
    );
    item.projects = projects;
    item.project_num = projects.length;
    return item;
  };

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
    const params = { ...filters };

    const result = await this.client.list(params);
    const roleAssignmentsResult = await this.roleAssignmentClient.list();
    const data = get(result, this.listResponseKey, []);
    Promise.all(
      data.map(
        (it) => this.client.users.list(it.id)
        // const { users } = userResult;
        // return { ...it, users };
      )
    ).then((rest) => {
      const addUserItem = data.map((it, index) => {
        const { users } = rest[index];
        const userIds = users.map((user) => user.id);
        const userInfo = users.map((user) => ({
          id: user.id,
          name: user.name,
        }));
        it.users = userIds;
        it.user_num = users.length;
        it.user_info = userInfo;
        return it;
      });
      const items = addUserItem.map((item) =>
        this.mapperProject(roleAssignmentsResult, item)
      );
      // const items = addUserItem.map(this.mapperProject);
      this.list.update({
        data: items,
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
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const [roleAssignmentsResult, groupResult, usersInGroup] =
      await Promise.all([
        this.roleAssignmentClient.list(),
        this.client.show(id),
        this.client.users.list(id),
      ]);
    const originData = get(groupResult, this.responseKey) || groupResult;
    const { users } = usersInGroup;
    const userIds = users.map((user) => user.id);
    originData.users = userIds;
    originData.user_num = users.length;
    originData.user_info = users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
    const group = this.mapperProject(roleAssignmentsResult, originData);
    this.detail = group;
    this.isLoading = false;
    return this.detail;
  }

  @action
  async fetchGroupData() {
    const result = await this.client.list();
    const { groups } = result;
    return groups;
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
      if (roleAssignment.group) {
        const {
          group: { id: group_id },
          role: { id: role_id },
          scope: { project, system } = {},
        } = roleAssignment;
        if (role_id === roleId && project) {
          const projectData = projectResult.projects.find(
            (it) => it.id === project.id
          );
          if (projectRoleUsers[group_id]) {
            projectRoleUsers[group_id].push(projectData.name);
          } else {
            projectRoleUsers[group_id] = [projectData.name];
          }
        } else if (role_id === roleId && system) {
          systemRoleUsers[group_id] = system.all;
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

    // const items = data.map(this.mapper);
    // const newData = await this.listDidFetch(items);
    Promise.all(data.map((it) => this.client.users.list(it.id))).then(
      (rest) => {
        items.map((it, index) => {
          const { users } = rest[index];
          const userIds = users.map((user) => user.id);
          const userInfo = users.map((user) => ({
            id: user.id,
            name: user.name,
          }));
          it.users = userIds;
          it.user_num = users.length;
          it.user_info = userInfo;
          return it;
        });
        this.list.update({
          data: items,
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
}

const globalGroupStore = new GroupStore();
export default globalGroupStore;
