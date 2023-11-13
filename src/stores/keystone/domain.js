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

export class DomainStore extends Base {
  @observable
  domains = [];

  get client() {
    return client.keystone.domains;
  }

  get userClient() {
    return client.keystone.users;
  }

  get userGroupClient() {
    return client.keystone.groups;
  }

  get projectClient() {
    return client.keystone.projects;
  }

  async listDidFetch(items) {
    if (!items.length) {
      return items;
    }
    const [userResult, projectResult, userGroupResult] = await Promise.all([
      this.userClient.list(),
      this.projectClient.list(),
      this.userGroupClient.list(),
    ]);
    return items.map((it) => {
      const users = (userResult.users || []).filter(
        (user) => user.domain_id === it.id
      );
      const projects = (projectResult.projects || []).filter(
        (project) => project.domain_id === it.id
      );
      const groups = (userGroupResult.groups || []).filter(
        (group) => group.domain_id === it.id
      );
      return {
        ...it,
        users,
        userCount: users.length,
        projects,
        projectCount: projects.length,
        groups,
        groupCount: groups.length,
      };
    });
  }

  async detailDidFetch(item) {
    const { id } = item;
    const [userResult, projectResult, groupResult] = await Promise.all([
      this.userClient.list({ domain_id: id }),
      this.projectClient.list({ domain_id: id }),
      this.userGroupClient.list({ domain_id: id }),
    ]);
    const { users = [] } = userResult || {};
    const { projects = [] } = projectResult || {};
    const { groups = [] } = groupResult || {};
    return {
      ...item,
      users,
      userCount: users.length,
      projects,
      projectCount: projects.length,
      groups,
      groupCount: groups.length,
    };
  }

  @action
  async fetchDomain() {
    const domainsResult = await this.client.list();
    this.domains = domainsResult.domains;
  }

  @action
  async edit({ id, description, name }) {
    const reqBody = {
      domain: { description, name },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async forbidden({ id }) {
    const reqBody = {
      domain: { enabled: false },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  @action
  async enable({ id }) {
    const reqBody = {
      domain: { enabled: true },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }
}

const globalDomainStore = new DomainStore();
export default globalDomainStore;
