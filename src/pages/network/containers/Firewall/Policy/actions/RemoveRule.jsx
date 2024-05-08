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
import { ModalAction } from 'containers/Action';
import { tableOptions, isMine } from 'resources/neutron/firewall-rule';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Remove Rule');

  static policy = 'update_firewall_policy';

  get name() {
    return t('remove rule');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get rules() {
    const { rules } = this.item;
    return rules;
  }

  static allowed = (item) => Promise.resolve(isMine(item));

  get defaultValue() {
    return {
      name: this.item.name,
    };
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
        label: t('Rules'),
        type: 'select-table',
        required: true,
        data: this.rules,
        isMulti: false,
        ...tableOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { rule } = values;
    const body = {
      firewall_rule_id: rule.selectedRowKeys[0],
    };
    return globalFirewallPolicyStore.removeRule({ id }, body);
  };
}
export default inject('rootStore')(observer(Edit));
