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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalQoSPolicyStore from 'stores/neutron/qos-policy';
import dscpMarkingItems from './DSCPMarkingItems';

export class CreateDSCPMarkingRules extends ModalAction {
  static id = 'create_DSCP_marking_rule';

  static title = t('Create DSCP Marking Rule');

  get name() {
    return t('create DSCP marking rule');
  }

  static policy = 'create_policy_dscp_marking_rule';

  static allowed = (item) => {
    const { rules = [] } = item;
    const hasDSCPMarkingRule = rules.some((i) => i.type === 'dscp_marking');
    return Promise.resolve(!hasDSCPMarkingRule);
  };

  onSubmit = (values) =>
    globalQoSPolicyStore.createDSCPMarkingRule(this.props.item, values);

  get defaultValue() {
    return {
      dscp_mark: 0,
    };
  }

  get formItems() {
    return [
      {
        label: t('Type'),
        type: 'label',
        component: (
          <div style={{ lineHeight: '32px', marginBottom: 24 }}>
            {t('DSCP Marking')}
          </div>
        ),
      },
      {
        name: 'dscp_mark',
        label: t('Value'),
        type: 'select',
        options: dscpMarkingItems,
      },
    ];
  }
}

export default inject('rootStore')(observer(CreateDSCPMarkingRules));
