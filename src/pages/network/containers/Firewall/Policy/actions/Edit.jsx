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
import { isDefault, isMine } from 'resources/neutron/firewall-policy';
import { checkPolicyRule } from 'resources/skyline/policy';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit');

  init() {
    this.store = globalFirewallPolicyStore;
  }

  static policy = 'update_firewall_policy';

  static allowed = (item) => !isDefault(item) && isMine(item);

  get defaultValue() {
    const { name, shared, description, audited } = this.item;
    return {
      name,
      description,
      options: {
        shared,
        audited,
      },
    };
  }

  canChangeShared() {
    return checkPolicyRule('update_firewall_policy:shared');
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
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          {
            label: t('Shared'),
            value: 'shared',
            disabled: !this.canChangeShared(),
          },
          { label: t('Audited'), value: 'audited' },
        ],
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
    const { name, options: { shared, audited } = {}, description } = values;
    const body = {
      name,
      audited,
      description,
    };
    if (this.canChangeShared()) {
      body.shared = shared;
    }
    return this.store.edit({ id }, body);
  };
}

export default inject('rootStore')(observer(Edit));
