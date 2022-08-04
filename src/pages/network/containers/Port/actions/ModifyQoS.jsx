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
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import globalPortStore from 'stores/neutron/port-extension';
import { getQoSPolicyTabs } from 'resources/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';

export class ModifyQoS extends ModalAction {
  static id = 'modify_qos';

  static title = t('Modify QoS');

  get name() {
    return t('Modify QoS');
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 4 },
    };
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.qosPolicyStore = new QoSPolicyStore();
    this.state = {
      qosPolicy: {
        name: '',
        id: '',
      },
    };
    this.item.qos_policy_id && this.getQosPolicyItem();
  }

  async getQosPolicyItem() {
    const item = await this.qosPolicyStore.fetchDetail({
      id: this.item.qos_policy_id,
    });
    this.setState({
      qosPolicy: item,
    });
  }

  get instanceName() {
    return this.item.name || this.item.id;
  }

  get defaultValue() {
    const enableQosPolicy = this.item.qos_policy_id !== null;
    return {
      enableQosPolicy,
      qos_policy_id: {
        selectedRowKeys: enableQosPolicy ? [this.item.qos_policy_id] : [],
        selectedRows: enableQosPolicy
          ? [
              {
                id: this.item.qos_policy_id,
                name: this.item.qos_policy_id,
              },
            ]
          : [],
      },
    };
  }

  static policy = 'update_port';

  static allowed = () => Promise.resolve(!!qosEndpoint());

  onSubmit = (values) => {
    const { id } = this.item;
    const { enableQosPolicy, qos_policy_id } = values;
    const data = {
      qos_policy_id: null,
    };
    if (enableQosPolicy) {
      qos_policy_id &&
        (data.qos_policy_id =
          qos_policy_id.selectedRowKeys.length === 0
            ? null
            : qos_policy_id.selectedRowKeys[0]);
    }
    return globalPortStore.update({ id }, data);
  };

  get formItems() {
    const { enableQosPolicy = this.item.qos_policy_id !== null, qosPolicy } =
      this.state;
    return [
      {
        name: 'enableQosPolicy',
        label: t('Enable QoS Policy'),
        type: 'switch',
        onChange: (e) => {
          this.setState({
            enableQosPolicy: e,
          });
        },
      },
      {
        name: 'name',
        label: t('Current QoS policy name'),
        type: 'label',
        content: <div>{qosPolicy.name || t('Not yet bound')}</div>,
        hidden: !enableQosPolicy,
      },
      {
        name: 'qos_policy_id',
        label: t('QoS Policy'),
        type: 'tab-select-table',
        tabs: getQoSPolicyTabs.call(this, {
          disabledFunc: (item) => item.id === this.item.qos_policy_id,
        }),
        isMulti: false,
        required: true,
        tip: t('Choosing a QoS policy can limit bandwidth and DSCP'),
        hidden: !enableQosPolicy,
      },
    ];
  }
}

export default inject('rootStore')(observer(ModifyQoS));
