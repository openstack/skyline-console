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

export class CreateBandwidthLimitRule extends ModalAction {
  static id = 'create_bandwidth_limit_rule';

  static title = t('Create Bandwidth Limit Rule');

  get name() {
    return t('create bandwidth limit rule');
  }

  static policy = 'create_policy_bandwidth_limit_rule';

  static allowed = (item) => {
    const { rules = [] } = item;
    const hasIngressRule = rules.some((i) => i.direction === 'ingress');
    const hasEgress = rules.some((i) => i.direction === 'egress');
    return Promise.resolve(!(hasIngressRule && hasEgress));
  };

  onSubmit = (values) => {
    const { max_kbps, max_burst_kbps, ...rest } = values;
    const data = {
      ...rest,
      max_kbps: max_kbps * 1024,
      max_burst_kbps: max_burst_kbps * 1024,
    };
    return globalQoSPolicyStore.createBandwidthLimitRule(this.props.item, data);
  };

  get defaultValue() {
    return {
      max_kbps: 1,
      max_burst_kbps: 1,
      direction: 'egress',
    };
  }

  get formItems() {
    return [
      {
        label: t('Type'),
        type: 'label',
        component: (
          <div style={{ lineHeight: '32px', marginBottom: 24 }}>
            {t('QoS Bandwidth Limit')}
          </div>
        ),
      },
      {
        name: 'max_kbps',
        label: t('Bandwidth limit'),
        type: 'slider-input',
        max: 10000,
        min: 1,
        inputMin: 1,
        inputMax: 10000,
        description: '1Mbps-10000Mbps',
      },
      {
        name: 'max_burst_kbps',
        label: t('Burst limit'),
        type: 'slider-input',
        max: 10000,
        min: 1,
        inputMin: 1,
        inputMax: 10000,
        description: '1Mbps-10000Mbps',
      },
      {
        name: 'direction',
        label: t('Direction'),
        type: 'select',
        options: [
          {
            label: t('egress'),
            value: 'egress',
          },
          {
            label: t('ingress'),
            value: 'ingress',
          },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(CreateBandwidthLimitRule));
