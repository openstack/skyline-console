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

import client from 'client';
import { isDefault } from 'resources/neutron/firewall';
import Base from '../base';
import globalProjectMapStore from '../project';

export class FirewallStore extends Base {
  get client() {
    return client.neutron.firewalls;
  }

  get policyClient() {
    return client.neutron.firewallPolicies;
  }

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (data) => ({
      ...data,
      name: data.name || data.id,
      notDefault: !isDefault(data),
    });
  }

  async listDidFetch(items) {
    const egressPolicies = [];
    const ingressPolicies = [];
    items.forEach((it) => {
      const { egress_firewall_policy_id, ingress_firewall_policy_id } = it;
      if (egressPolicies.indexOf(egress_firewall_policy_id) < 0) {
        egressPolicies.push(egress_firewall_policy_id);
      }
      if (ingressPolicies.indexOf(ingress_firewall_policy_id) < 0) {
        ingressPolicies.push(ingress_firewall_policy_id);
      }
    });
    if (egressPolicies.length === 0 && ingressPolicies.length === 0) {
      return items;
    }
    const policies = await this.policyClient.list();
    items.forEach((it) => {
      const { egress_firewall_policy_id, ingress_firewall_policy_id } = it;
      it.egressPolicy = policies.firewall_policies.find(
        (p) => p.id === egress_firewall_policy_id
      );
      it.egressPolicyName = it.egressPolicy ? it.egressPolicy.name : '-';
      it.ingressPolicy = policies.firewall_policies.find(
        (p) => p.id === ingress_firewall_policy_id
      );
      it.ingressPolicyName = it.ingressPolicy ? it.ingressPolicy.name : '-';
    });
    return items;
  }

  async detailDidFetch(item) {
    const {
      egress_firewall_policy_id,
      ingress_firewall_policy_id,
      project_id,
    } = item;
    if (ingress_firewall_policy_id) {
      item.ingress = (
        await this.fetchPolicy(ingress_firewall_policy_id)
      ).firewall_policy;
    }
    if (egress_firewall_policy_id) {
      item.egress = (
        await this.fetchPolicy(egress_firewall_policy_id)
      ).firewall_policy;
    }
    const project = await globalProjectMapStore.fetchProjectDetail({
      id: project_id,
    });
    item.project_name = project ? project.name || '-' : '-';
    return item;
  }

  fetchPolicy(id) {
    return this.policyClient.show(id);
  }
}

const globalFirewallStore = new FirewallStore();
export default globalFirewallStore;
