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
import { getPasswordOtherRule, ipValidate } from 'utils/validate';
import globalVpnServicesStore from 'stores/neutron/vpn-service';
import globalVpnIKEPolicyStore from 'stores/neutron/vpn-ike-policy';
import globalVpnIPsecPolicyStore from 'stores/neutron/vpn-ipsec-policy';
import globalVPNEndPointGroupStore from 'stores/neutron/vpn-endpoint-group';
import { Col, Empty, Row } from 'antd';
import { merge } from 'lodash';
import globalVpnIPsecConnectionStore from 'stores/neutron/vpn-ipsec-connection';
import LocalSubnet from './components/LocalSubnet';

const { isIPv4, isIpv6 } = ipValidate;

export class Create extends ModalAction {
  static id = 'create-ipsec-site-connection';

  static title = t('Create IPsec Site Connection');

  get name() {
    return t('create ipsec site connection');
  }

  static buttonText = t('Create');

  static policy = 'create_ipsec_site_connection';

  static allowed = () => Promise.resolve(true);

  init() {
    this.vpnServiceStore = globalVpnServicesStore;
    this.ikePolicyStore = globalVpnIKEPolicyStore;
    this.ipsecPolicyStore = globalVpnIPsecPolicyStore;
    this.endpointGroupStore = globalVPNEndPointGroupStore;

    this.fetchData();
  }

  async fetchData() {
    await Promise.all([
      this.vpnServiceStore.fetchList(),
      this.ikePolicyStore.fetchList(),
      this.ipsecPolicyStore.fetchList(),
      this.endpointGroupStore.fetchList(),
    ]);
  }

  get defaultValue() {
    return {
      mtu: 1500,
      initiator: 'bi-directional',
      action: 'hold',
      interval: 30,
      timeout: 120,
    };
  }

  onSubmit = (values) => {
    const newValues = merge({}, this.defaultValue, values);
    const {
      interval,
      timeout,
      action,
      password,
      confirmPassword,
      more,
      ...rest
    } = newValues;
    const data = {
      ...rest,
      psk: password,
      peer_id: rest.peer_address,
      dpd: {
        interval,
        timeout,
        action,
      },
    };
    return globalVpnIPsecConnectionStore.create(data);
  };

  get formItems() {
    const {
      local_ep_group_id = undefined,
      peer_ep_group_id = undefined,
      more,
    } = this.state;

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      {
        name: 'vpnservice_id',
        label: t('VPN Service'),
        type: 'select',
        options: this.vpnServiceStore.list.data.map((i) => ({
          label: i.name,
          value: i.id,
        })),
        required: true,
      },
      {
        name: 'ikepolicy_id',
        label: t('IKE Policy'),
        type: 'select',
        options: this.ikePolicyStore.list.data.map((i) => ({
          label: i.name,
          value: i.id,
        })),
        required: true,
      },
      {
        name: 'ipsecpolicy_id',
        label: t('IPsec Policy'),
        type: 'select',
        options: this.ipsecPolicyStore.list.data.map((i) => ({
          label: i.name,
          value: i.id,
        })),
        required: true,
      },
      {
        name: 'local_ep_group_id',
        label: t('Local Endpoint Group'),
        type: 'select',
        options: this.endpointGroupStore.list.data
          .filter((i) => i.type === 'subnet')
          .map((i) => ({
            label: i.name,
            value: i.id,
          })),
        onChange: (e) => {
          this.setState({
            local_ep_group_id: e,
          });
        },
        required: true,
      },
      {
        name: 'local_subnet',
        type: 'label',
        label: t('Local Subnet'),
        component: (
          <LocalSubnet
            data={this.endpointGroupStore.list.data}
            local_ep_group_id={local_ep_group_id}
          />
        ),
      },
      {
        name: 'peer_address',
        type: 'input',
        label: t('Peer Gateway Public Address'),
        extra: t('Peer gateway public address for the IPsec site connection'),
        validator: (rule, value) => {
          if (!isIPv4(value) && !isIpv6(value)) {
            return Promise.reject(
              new Error(`${t('Invalid')} ${t('Peer Gateway Public Address')}`)
            );
          }
          return Promise.resolve();
        },
        required: true,
      },
      {
        name: 'peer_ep_group_id',
        label: t('Peer Endpoint Group'),
        type: 'select',
        options: this.endpointGroupStore.list.data
          .filter((i) => i.type === 'cidr')
          .map((i) => ({
            label: i.name,
            value: i.id,
          })),
        onChange: (e) => {
          this.setState({
            peer_ep_group_id: e,
          });
        },
        required: true,
      },
      {
        name: 'peer_cidrs',
        type: 'label',
        label: t('Peer Cidrs'),
        component: (
          <Row>
            {!peer_ep_group_id ? (
              <Col span={24}>
                <Empty />
              </Col>
            ) : (
              this.endpointGroupStore.list.data
                .find((i) => i.id === peer_ep_group_id)
                .endpoints.map((item) => <Col span={24}>{item}</Col>)
            )}
          </Row>
        ),
      },
      {
        name: 'password',
        type: 'input-password',
        label: t('Pre-Shared Key(PSK) String'),
        otherRule: getPasswordOtherRule('password', 'instance'),
        required: true,
      },
      {
        name: 'confirmPassword',
        type: 'input-password',
        label: t('Confirm Shared Key'),
        otherRule: getPasswordOtherRule(
          'confirmPassword',
          'instance',
          undefined,
          t('Pre-Shared Key must be the same with Confirm Shared Key.')
        ),
        required: true,
      },
      {
        name: 'mtu',
        type: 'input-number',
        label: t('MTU'),
        min: 68,
        tip: t(
          'The maximum transmission unit (MTU) value to address fragmentation. Minimum value is 68 for IPv4, and 1280 for IPv6.'
        ),
        required: true,
        hidden: !more,
      },
      {
        name: 'initiator',
        label: t('Initiator Mode'),
        type: 'select',
        options: ['bi-directional', 'response-only'].map((item) => ({
          label: item,
          value: item,
        })),
        tip: t(
          'Indicates whether this VPN can only respond to connections or both respond to and initiate connections.'
        ),
        required: true,
        hidden: !more,
      },
      {
        name: 'action',
        label: t('DPD Action'),
        type: 'select',
        options: [
          'clear',
          'hold',
          'restart',
          'disabled',
          'restart-by-peer',
        ].map((item) => ({
          label: item,
          value: item,
        })),
        tip: t('DPD actions controls the use of Dead Peer Detection Protocol.'),
        required: true,
        hidden: !more,
      },
      {
        name: 'interval',
        type: 'input-number',
        label: t('DPD Interval (sec)'),
        min: 0,
        tip: t('Sec for DPD delay, > 0'),
        required: true,
        hidden: !more,
      },
      {
        name: 'timeout',
        type: 'input-number',
        label: t('DPD timeout (sec)'),
        min: 0,
        tip: t('Sec for DPD timeout, > 0 & > DPD Interval'),
        required: true,
        hidden: !more,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
    ];
  }
}
export default inject('rootStore')(observer(Create));
