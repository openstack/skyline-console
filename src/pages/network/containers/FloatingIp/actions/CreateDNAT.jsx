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
import { DesktopOutlined } from '@ant-design/icons';
import { ModalAction } from 'containers/Action';
import { isNull } from 'lodash';
import { getCanReachSubnetIdsWithRouterIdInComponent } from 'resources/neutron/router';
import { PortStore } from 'stores/neutron/port';
import { getPortFormItem, getPortsAndReasons } from 'resources/neutron/port';
import { getInterfaceWithReason } from 'resources/neutron/floatingip';
import globalPortForwardingStore from 'stores/neutron/port-forwarding';
import { enablePFW } from 'resources/neutron/neutron';

export class CreateDNAT extends ModalAction {
  static id = 'createDNAT';

  static title = t('Create DNAT Rule');

  get name() {
    return t('Create DNAT rule');
  }

  init() {
    this.portStore = new PortStore();
    getCanReachSubnetIdsWithRouterIdInComponent.call(this, (router) => {
      const { item } = this;
      return (
        router.external_gateway_info &&
        router.external_gateway_info.network_id === item.floating_network_id
      );
    });
    this.getFipAlreadyUsedPorts();
    this.state = {
      alreadyUsedPorts: [],
      instanceFixedIPs: [],
      portFixedIPs: [],
      canReachSubnetIdsWithRouterId: [],
      routerIdWithExternalNetworkInfo: [],
    };
  }

  async getFipAlreadyUsedPorts() {
    const detail = await globalPortForwardingStore.fetchList({
      fipId: this.item.id,
    });
    this.setState({
      alreadyUsedPorts: detail || [],
    });
  }

  get instanceName() {
    return this.item.floating_ip_address || this.values.name;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  portsDisableFunc = (i) => i.fixed_ips.length === 0;

  get defaultValue() {
    const { floating_ip_address } = this.item;
    const value = {
      floatingIp: floating_ip_address,
    };
    return value;
  }

  handlePortSelect = async (data) => {
    this.setState({
      fixedIpLoading: true,
    });
    const { canReachSubnetIdsWithRouterId } = this.state;
    const interfacesWithReason = await getInterfaceWithReason(
      data.selectedRows
    );
    const portFixedIPs = getPortsAndReasons(
      interfacesWithReason,
      canReachSubnetIdsWithRouterId,
      true
    );

    this.setState({
      portFixedIPs,
      fixed_ip_address: undefined,
      fixedIpLoading: false,
    });

    this.formRef.current &&
      this.formRef.current.resetFields(['fixed_ip_address', 'internal_port']);
  };

  static policy = 'create_floatingip_port_forwarding';

  static allowed = (item) => {
    return Promise.resolve(isNull(item.fixed_ip_address) && enablePFW());
  };

  onSubmit = (values) => {
    const {
      floatingIp,
      virtual_adapter: { selectedRows = [] } = {},
      fixed_ip_address: { selectedRows: fixedIPAddressSelectedRows = [] } = {},
      ...rest
    } = values;
    const data = {
      ...rest,
    };
    data.internal_ip_address = fixedIPAddressSelectedRows[0].fixed_ip_address;
    data.internal_port_id = selectedRows[0].id;
    return globalPortForwardingStore.create({
      id: this.item.id,
      data,
    });
  };

  get formItems() {
    const { fixed_ip_address = { selectedRows: [] } } = this.state;
    const ret = [
      {
        name: 'floatingIp',
        label: t('Floating Ip'),
        type: 'label',
        icon: <DesktopOutlined />,
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        options: [
          {
            label: 'TCP',
            value: 'tcp',
          },
          {
            label: 'UDP',
            value: 'udp',
          },
        ],
        required: true,
      },
      {
        name: 'external_port',
        label: t('External Port'),
        type: 'input-number',
        min: 1,
        max: 65535,
        required: true,
        validator: (_, val) => {
          if (!val) {
            return Promise.reject(
              new Error(`${t('Please input')} ${t('External Port')}`)
            );
          }
          const { alreadyUsedPorts } = this.state;
          const flag = alreadyUsedPorts.some((pf) => pf.external_port === val);
          if (flag) {
            return Promise.reject(
              new Error(
                t('The port of this fip is in use, Please change another port.')
              )
            );
          }
          return Promise.resolve(true);
        },
      },
      {
        name: 'internal_port',
        label: t('Internal Port'),
        type: 'input-number',
        hidden: fixed_ip_address.selectedRows.length === 0,
        min: 1,
        max: 65535,
        required: true,
        validator: (_, val) => {
          if (!val) {
            return Promise.reject(
              new Error(`${t('Please input')} ${t('Internal Port')}`)
            );
          }
          const formData = this.formRef.current.getFieldsValue([
            'virtual_adapter',
            'fixed_ip_address',
          ]);
          const internal_ip_address =
            formData.fixed_ip_address.selectedRows[0].fixed_ip_address;
          const internal_port_id = formData.virtual_adapter.selectedRows[0].id;
          const { alreadyUsedPorts } = this.state;
          // determine whether the FIP has been bound to the port of the port
          const flag = alreadyUsedPorts.some(
            (pf) =>
              pf.internal_port === val &&
              pf.internal_port_id === internal_port_id &&
              pf.internal_ip_address === internal_ip_address
          );
          if (flag) {
            return Promise.reject(
              new Error(
                t(
                  'A DNAT rule has been created for this port of this IP, please choose another port.'
                )
              )
            );
          }
          return Promise.resolve(true);
        },
      },
    ];
    const extraColumn = getPortFormItem.call(this, ['compute:nova', '']);
    const portIndex = extraColumn.findIndex(
      (i) => i.name === 'virtual_adapter'
    );
    extraColumn[portIndex].label = t('Target Port');

    const fixedIPAddressIndex = extraColumn.findIndex(
      (i) => i.name === 'fixed_ip_address'
    );
    extraColumn[fixedIPAddressIndex].label = t('Target IP Address');
    extraColumn[fixedIPAddressIndex].onChange = (e) => {
      this.setState(
        {
          fixed_ip_address: e,
        },
        () => {
          this.formRef.current.resetFields(['internal_port']);
        }
      );
    };

    ret.splice(3, 0, ...extraColumn);
    return ret;
  }
}

export default inject('rootStore')(observer(CreateDNAT));
