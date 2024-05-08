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
import { checkPolicyRule } from 'resources/skyline/policy';
import {
  fetchNeutronQuota,
  getQuotaInfo,
  checkQuotaDisable,
} from 'resources/neutron/network';

const quotaKeys = ['firewall_policy'];
const wishes = [1];

export class Create extends ModalAction {
  static id = 'create-simple';

  static title = t('Create Firewall Policy');

  static buttonText = t('Create Policy');

  get name() {
    return t('create firewall policy');
  }

  init() {
    this.store = globalFirewallPolicyStore;
    fetchNeutronQuota(this);
  }

  static policy = 'create_firewall_policy';

  static allowed = () => Promise.resolve(true);

  static get disableSubmit() {
    return checkQuotaDisable(quotaKeys, wishes);
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    return getQuotaInfo(this, quotaKeys, wishes);
  }

  get defaultValue() {
    return {
      options: {
        shared: false,
        audited: false,
      },
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
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          {
            label: t('Shared'),
            value: 'shared',
            disabled: !checkPolicyRule('update_firewall_policy:shared'),
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
    const { name, description, options: { shared, audited } = {} } = values;
    const body = {
      name,
      shared,
      audited,
      description,
    };
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
