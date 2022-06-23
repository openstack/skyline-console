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
import { ModalAction } from 'containers/Action';
import globalSecurityGroupStore from 'stores/neutron/security-group';
import globalProjectStore from 'stores/keystone/project';

const defaultRuleCount = 2;

const getAdd = (groupQuota, ruleQuota) => {
  const { left: groupLeft = 0 } = groupQuota || {};
  const { left: ruleLeft = 0 } = ruleQuota || {};
  const add =
    groupLeft !== 0 && (ruleLeft >= defaultRuleCount || ruleLeft === -1)
      ? 1
      : 0;
  return add;
};

export class CreateAction extends ModalAction {
  static id = 'create';

  static title = t('Create Security Group');

  get name() {
    return t('Create security group');
  }

  static policy = 'create_security_group';

  static allowed = () => Promise.resolve(true);

  init() {
    this.state.groupQuota = {};
    this.state.ruleQuota = {};
    this.state.quotaLoading = true;
    this.projectStore = globalProjectStore;
    this.getQuota();
  }

  static get disableSubmit() {
    const {
      neutronQuota: { security_group = {}, security_group_rule = {} } = {},
    } = globalProjectStore;
    const add = getAdd(security_group, security_group_rule);
    return add === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    const result = await this.projectStore.fetchProjectNeutronQuota();
    const {
      security_group: groupQuota = {},
      security_group_rule: ruleQuota = {},
    } = result || {};
    this.setState({
      groupQuota,
      ruleQuota,
      quotaLoading: false,
    });
  }

  get tips() {
    return t(
      'This operation creates a security group with default security group rules for the IPv4 and IPv6 ether types.'
    );
  }

  get quotaInfo() {
    const { groupQuota = {}, ruleQuota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const add = getAdd(groupQuota, ruleQuota);
    const groupQuotaData = {
      ...groupQuota,
      add,
      name: 'security_group',
      title: t('Security Group'),
    };
    const ruleQuotaData = {
      ...ruleQuota,
      add: add * defaultRuleCount,
      name: 'security_group_rule',
      title: t('Security Group Rule'),
      type: 'line',
    };
    return [groupQuotaData, ruleQuotaData];
  }

  get defaultValue() {
    const value = {};
    return value;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    return globalSecurityGroupStore.create(values);
  };
}

export default inject('rootStore')(observer(CreateAction));
