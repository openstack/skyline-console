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
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { getQoSPolicyTabs } from 'resources/neutron/qos-policy';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';

export class Edit extends ModalAction {
  static id = 'edit-floating-ip';

  static policy = 'update_floatingip';

  static get modalSize() {
    return qosEndpoint() ? 'large' : 'small';
  }

  getModalSize() {
    return qosEndpoint() ? 'large' : 'small';
  }

  get qosEndpoint() {
    return qosEndpoint();
  }

  init() {
    this.qosPolicyStore = new QoSPolicyStore();
  }

  get defaultValue() {
    const { item } = this.props;
    return {
      description: this.item.description,
      ...(this.qosEndpoint
        ? {
            qos_policy_id: {
              selectedRowKeys: item.qos_policy_id ? [item.qos_policy_id] : [],
              selectedRows: item.qos_policy_id
                ? [
                    {
                      id: item.qos_policy_id,
                      name: item.qos_policy_id,
                    },
                  ]
                : [],
            },
          }
        : {}),
    };
  }

  get instanceName() {
    return this.item.floating_ip_address;
  }

  static allowed = () => Promise.resolve(true);

  onSubmit = (values) => {
    const { description, qos_policy_id } = values;
    const body = {
      description,
    };
    if (this.qosEndpoint) {
      body.qos_policy_id = qos_policy_id
        ? qos_policy_id.selectedRowKeys.length
          ? qos_policy_id.selectedRowKeys[0]
          : null
        : null;
    }
    return globalFloatingIpsStore.edit({ id: this.item.id }, body);
  };

  get formItems() {
    return [
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'qos_policy_id',
        label: t('QoS Policy'),
        type: 'tab-select-table',
        tabs: getQoSPolicyTabs.call(this),
        isMulti: false,
        tip: t('Choosing a QoS policy can limit bandwidth and DSCP'),
        display: !!this.qosEndpoint,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
