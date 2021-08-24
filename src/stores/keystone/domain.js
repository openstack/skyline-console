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
import Base from '../base';

export class DomainStore extends Base {
  @observable
  domains = [];

  @observable
  domainUsers = [];

  @observable
  adminRoleId = '';

  get client() {
    return client.keystone.domains;
  }

  get userClient() {
    return client.keystone.users;
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

    await Promise.all([this.client.list(), this.userClient.list()]).then(
      ([domainsResult, usersResult]) => {
        const { domains } = domainsResult;
        // eslint-disable-next-line array-callback-return
        domains.map((domain) => {
          const domainUsers = usersResult.users.filter(
            (it) => it.domain_id === domain.id
          );
          domain.user_num = domainUsers.length;
        });

        // const { domains: items } = domainsResult;
        this.list.update({
          data: domains,
          total: domains.length || 0,
          limit: Number(limit) || 10,
          page: Number(page) || 1,
          sortKey,
          sortOrder,
          filters,
          isLoading: false,
          ...(this.list.silent ? {} : { selectedRowKeys: [] }),
        });
        return domains;
      }
    );
  }

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    await Promise.all([this.client.show(id), this.userClient.list()]).then(
      ([result, usersResult]) => {
        const domain = this.mapper(get(result, this.responseKey) || result);
        domain.domain_administrator = [];
        const domainUsers = usersResult.users.filter(
          (it) => it.domain_id === domain.id
        );
        domain.user_num = domainUsers.length;
        this.domainUsers = domainUsers;
        this.detail = domain;
        this.isLoading = false;
        return domain;
      }
    );
  }

  @action
  async fetchDomain() {
    const doaminsResult = await this.client.list();
    this.domains = doaminsResult.domains;
  }

  @action
  async update({ id, body }) {
    this.isSubmitting = true;
    const resData = await this.client.update(id, body);
    this.isSubmitting = false;
    return resData;
  }

  @action
  async edit({ id, description }) {
    const reqBody = {
      domain: { description },
    };
    return this.submitting(this.client.patch(id, reqBody));
  }

  async setDomainAdmin({ id, user_id, role_id }) {
    return this.submitting(this.client.users.roles.put(id, user_id, role_id));
  }

  async deleteDomainAdmin({ id, user_id, role_id }) {
    const result = await this.client.users.roles.delete(id, user_id, role_id);
    return result;
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
