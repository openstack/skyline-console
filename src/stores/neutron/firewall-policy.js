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

import { action } from 'mobx';
import client from 'client';
import { isDefault } from 'resources/neutron/firewall-policy';
import Base from '../base';

export class FirewallPolicyStore extends Base {
  get client() {
    return client.neutron.firewallPolicies;
  }

  get listResponseKey() {
    return 'firewall_policies';
  }

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (data) => ({
      ...data,
      notDefault: !isDefault(data),
    });
  }

  async listDidFetch(items) {
    const rules = [];
    items.forEach((it) => {
      it.firewalls = [];
      it.rules = [];
      const { firewall_rules } = it;
      firewall_rules.forEach((rule) => {
        if (rules.indexOf(rule) < 0) {
          rules.push(rule);
        }
      });
    });
    if (rules.length === 0) {
      return items;
    }
    const ruleResponse = await client.neutron.firewallRules.list();
    const allRules = ruleResponse.firewall_rules.map((it) => ({
      ...it,
      protocol: it.protocol || 'any',
    }));
    items.forEach((it) => {
      const { firewall_rules } = it;
      it.rules = firewall_rules.map((rule) =>
        allRules.find((r) => r.id === rule)
      );
    });
    const firewallResponse = await client.neutron.firewalls.list();
    const allFirewalls = firewallResponse.firewall_groups;
    items.forEach((it) => {
      it.firewalls = allFirewalls.filter(
        (firewall) =>
          firewall.egress_firewall_policy_id === it.id ||
          firewall.ingress_firewall_policy_id === it.id
      );
    });
    return items;
  }

  async detailDidFetch(item) {
    const rules = [];
    item.firewalls = [];
    item.rules = [];
    const { firewall_rules } = item;
    firewall_rules.forEach((rule) => {
      if (rules.indexOf(rule) < 0) {
        rules.push(rule);
      }
    });
    if (rules.length === 0) {
      return item;
    }
    const ruleResponse = await client.neutron.firewallRules.list();
    const allRules = ruleResponse.firewall_rules.map((it) => ({
      ...it,
      protocol: it.protocol || 'any',
    }));
    item.rules = firewall_rules.map((rule) =>
      allRules.find((r) => r.id === rule)
    );
    const firewallResponse = await client.neutron.firewalls.list();
    const allFirewalls = firewallResponse.firewall_groups;
    item.firewalls = allFirewalls.filter(
      (firewall) =>
        firewall.egress_firewall_policy_id === item.id ||
        firewall.ingress_firewall_policy_id === item.id
    );
    return item;
  }

  @action
  async insertRule({ id }, body) {
    return this.submitting(this.client.insertRule(id, body));
  }

  @action
  async removeRule({ id }, body) {
    return this.submitting(this.client.removeRule(id, body));
  }
}

const globalFirewallPolicyStore = new FirewallPolicyStore();
export default globalFirewallPolicyStore;
