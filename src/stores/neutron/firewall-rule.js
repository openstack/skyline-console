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

import { get } from 'lodash';
import { action } from 'mobx';
import client from 'client';
import { isDefault } from 'resources/neutron/firewall-rule';
import Base from '../base';

export class FirewallRuleStore extends Base {
  get client() {
    return client.neutron.firewallRules;
  }

  get policyClient() {
    return client.neutron.firewallPolicies;
  }

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (item) => ({
      ...item,
      protocol: item.protocol || 'any',
      notDefault: !isDefault(item),
    });
  }

  async listDidFetch(items) {
    const policyResponse = await this.policyClient.list();
    const allPolicies = policyResponse.firewall_policies;
    items.forEach((it) => {
      it.policies = allPolicies.filter(
        (policy) => policy.firewall_rules.indexOf(it.id) >= 0
      );
    });

    return items;
  }

  async detailDidFetch(item) {
    const policyResponse = await this.policyClient.list();
    const allPolicies = policyResponse.firewall_policies;
    item.policies = allPolicies.filter(
      (policy) => policy.firewall_rules.indexOf(item.id) >= 0
    );
    return item;
  }

  @action
  async fetchListByPolicy({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    const { tab, all_projects, firewall_rules, ...rest } = filters;
    if (firewall_rules.length === 0) {
      this.list.isLoading = false;
      return;
    }
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    const result = await this.client.list(params);
    const allRules = get(result, this.listResponseKey, []);
    const data = firewall_rules.map((rule) =>
      allRules.find((r) => r.id === rule)
    );
    const items = data.map(this.mapper);
    let newData = await this.listDidFetchProject(items, all_projects);
    newData = await this.listDidFetch(newData, all_projects);
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

    return newData;
  }
}

const globalFirewallRuleStore = new FirewallRuleStore();
export default globalFirewallRuleStore;
