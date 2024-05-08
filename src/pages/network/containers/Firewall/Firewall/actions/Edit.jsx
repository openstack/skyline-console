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

import { inject, observer } from 'mobx-react';
import globalFirewallPolicyStore from 'stores/neutron/firewall-policy';
import globalFirewallStore from 'stores/neutron/firewall';
import { ModalAction } from 'containers/Action';
import { tableOptions } from 'resources/neutron/firewall-policy';
import { isDefault, isMine } from 'resources/neutron/firewall';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit');

  init() {
    this.store = globalFirewallStore;
    this.policyStore = globalFirewallPolicyStore;
    this.getPolicies();
  }

  static policy = 'update_firewall_group';

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  async getPolicies() {
    await this.policyStore.fetchList();
    this.updateDefaultValue();
  }

  get policies() {
    const { id } = this.item;
    return (this.policyStore.list.data || [])
      .filter((it) => {
        if (it.firewalls.length < 2) {
          return true;
        }
        const firewall = it.firewalls.find((tt) => tt.id === id);
        return !!firewall;
      })
      .map((it) => ({
        ...it,
        key: it.id,
      }));
  }

  static allowed = (item) => Promise.resolve(!isDefault(item) && isMine(item));

  get defaultValue() {
    if (this.policies.length === 0) {
      return {};
    }
    const {
      ingress_firewall_policy_id,
      egress_firewall_policy_id,
      admin_state_up,
      description,
    } = this.item;
    return {
      name: this.item.name,
      ingressPolicy: {
        selectedRowKeys: ingress_firewall_policy_id
          ? [ingress_firewall_policy_id]
          : [],
      },
      egressPolicy: {
        selectedRowKeys: egress_firewall_policy_id
          ? [egress_firewall_policy_id]
          : [],
      },
      options: {
        admin_state_up,
      },
      description,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'ingressPolicy',
        label: t('Ingress Policy'),
        type: 'select-table',
        data: this.policies,
        isLoading: this.policyStore.list.isLoading,
        isMulti: false,
        ...tableOptions,
      },
      {
        name: 'egressPolicy',
        label: t('Egress Policy'),
        type: 'select-table',
        data: this.policies,
        isLoading: this.policyStore.list.isLoading,
        isMulti: false,
        ...tableOptions,
      },
      {
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [{ label: t('Admin State'), value: 'admin_state_up' }],
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      ingressPolicy,
      egressPolicy,
      options: { admin_state_up = true } = {},
      ...rest
    } = values;
    const ingress_firewall_policy_id = ingressPolicy.selectedRowKeys[0] || null;
    const egress_firewall_policy_id = egressPolicy.selectedRowKeys[0] || null;
    const body = {
      admin_state_up,
      ingress_firewall_policy_id,
      egress_firewall_policy_id,
      ...rest,
    };
    return this.store.edit({ id }, body);
  };
}

export default inject('rootStore')(observer(Edit));
