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
import globalFirewallRuleStore from 'stores/neutron/firewall-rule';
import { ModalAction } from 'containers/Action';
import { tableOptions, isMine } from 'resources/neutron/firewall-rule';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Insert Rule');

  init() {
    this.store = globalFirewallPolicyStore;
    this.ruleStore = globalFirewallRuleStore;
    this.getRules();
  }

  static policy = 'update_firewall_policy';

  get name() {
    return t('insert rule');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  getRules() {
    this.ruleStore.fetchList();
  }

  get rules() {
    return (this.ruleStore.list.data || [])
      .filter((it) => this.currentRules.every((rule) => rule.id !== it.id))
      .filter((it) => {
        if (this.item.shared) {
          return it.shared;
        }
        return true;
      })
      .map((it) => ({
        ...it,
        key: it.id,
      }));
  }

  get currentRules() {
    const { rules } = this.item;
    return rules;
  }

  static allowed = (item) => Promise.resolve(isMine(item));

  get defaultValue() {
    const { name } = this.item;
    return {
      name,
      insert: 'before',
    };
  }

  get insertTypes() {
    return [
      {
        label: t('Insert Before'),
        value: 'before',
      },
      {
        label: t('Insert After'),
        value: 'after',
      },
    ];
  }

  get tips() {
    const tip = t(
      'A rule specified before insertion or after insertion a rule. If both are not specified, the new rule is inserted as the first rule of the policy.'
    );
    if (this.item.shared) {
      return tip + t('Shared policy only can insert shared rules.');
    }
    return tip;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'policy',
      },
      {
        name: 'rule',
        label: t('Rule'),
        type: 'select-table',
        required: true,
        data: this.rules,
        isLoading: this.ruleStore.list.isLoading,
        isMulti: false,
        ...tableOptions,
      },
      {
        name: 'insert',
        label: t('Insert'),
        type: 'radio',
        options: this.insertTypes,
        required: true,
      },
      {
        name: 'current',
        label: t('Current Rules'),
        type: 'select-table',
        data: this.currentRules,
        isMulti: false,
        ...tableOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { rule, insert, current: { selectedRowKeys = [] } = {} } = values;
    const firewall_rule_id = rule.selectedRowKeys[0];
    let insertAfter = '';
    let insertBefore = '';
    if (selectedRowKeys.length > 0) {
      if (insert === 'before') {
        insertBefore = selectedRowKeys[0];
      } else {
        insertAfter = selectedRowKeys[0];
      }
    }
    const body = {
      firewall_policy_id: id,
      firewall_rule_id,
      insert_before: insertBefore,
      insert_after: insertAfter,
    };
    return this.store.insertRule({ id }, body);
  };
}

export default inject('rootStore')(observer(Edit));
