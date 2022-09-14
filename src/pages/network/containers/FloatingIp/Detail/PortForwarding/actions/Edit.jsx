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
import globalPortForwardingStore from 'stores/neutron/port-forwarding';
import globalPortStore from 'stores/neutron/port-extension';
import { getCanReachSubnetIdsWithRouterIdInComponent } from 'resources/neutron/router';
import {
  getInterfaceWithReason,
  getPortForwardingName,
} from 'resources/neutron/floatingip';
import { getPortsAndReasons } from 'resources/neutron/port';
import { CreatePortForwarding as Base } from './Create';

export class Edit extends Base {
  static id = 'edit';

  static title = t('Edit');

  get name() {
    return t('Edit Port Forwarding');
  }

  get instanceName() {
    const { floating_ip_address: fip } = this.item;
    return getPortForwardingName(this.item, fip);
  }

  get tips() {
    return '';
  }

  get fipId() {
    return this.item.fip.id;
  }

  getExtraInfo() {
    getCanReachSubnetIdsWithRouterIdInComponent
      .call(this, (router) => {
        const {
          item: { fip },
        } = this;
        return (
          router.external_gateway_info &&
          router.external_gateway_info.network_id === fip.floating_network_id
        );
      })
      .then(() => {
        this.getInitialPortFixedIPs();
      });
  }

  async getInitialPortFixedIPs() {
    this.setState({
      fixedIpLoading: true,
    });
    const { internal_port_id, internal_ip_address } = this.item;
    const portDetail = await globalPortStore.fetchDetail({
      id: internal_port_id,
    });
    return this.handlePortSelect({ selectedRows: [portDetail] })
      .then((portFixedIPs) => {
        const tmp = portFixedIPs.filter(
          (i) => i.fixed_ip_address === internal_ip_address
        );
        const fixed_ip_address = {
          selectedRowKeys: tmp.map((i) => i.id),
          selectedRows: tmp,
        };
        this.updateFormValue('virtual_adapter', {
          selectedRowKeys: [portDetail.id],
          selectedRows: [portDetail],
        });
        return fixed_ip_address;
      })
      .then((fixed_ip_address) => {
        this.setState({
          fixed_ip_address,
        });
      });
  }

  get defaultValue() {
    const {
      floating_ip_address,
      fip,
      internal_port_id,
      internal_ip_address,
      ...rest
    } = this.item;
    const value = {
      floatingIp: floating_ip_address,
      virtual_adapter: {
        selectedRowKeys: [internal_port_id],
      },
      fixed_ip_address: {
        selectedRowKeys: [internal_ip_address],
        selectedRows: [{ fixed_ip_address: internal_ip_address }],
      },
      ...rest,
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
      this.formRef.current.resetFields(['fixed_ip_address']);
    return portFixedIPs;
  };

  static policy = 'update_floatingip_port_forwarding';

  static allowed = () => true;

  getSubmitData(values) {
    const {
      floatingIp,
      virtual_adapter: { selectedRows = [] } = {},
      fixed_ip_address: { selectedRows: fixedIPAddressSelectedRows = [] } = {},
      external_port,
      internal_port,
      ...rest
    } = values;
    const data = {
      ...rest,
    };
    if (external_port.toString().includes(':')) {
      data.external_port_range = external_port;
    } else {
      data.external_port = external_port;
    }
    if (internal_port.toString().includes(':')) {
      data.internal_port_range = internal_port;
    } else {
      data.internal_port = internal_port;
    }
    data.internal_ip_address = fixedIPAddressSelectedRows[0].fixed_ip_address;
    data.internal_port_id = selectedRows[0].id;
    return data;
  }

  onSubmit = (data) => {
    return globalPortForwardingStore.edit(
      {
        fipId: this.fipId,
        id: this.item.id,
      },
      data
    );
  };

  get formItems() {
    const items = super.formItems;
    if (this.supportRange) {
      return items;
    }
    const externalPortItem = items.find((it) => it.name === 'external_port');
    const internalPortItem = items.find((it) => it.name === 'internal_port');
    externalPortItem.label = t('External Port');
    internalPortItem.label = t('Internal Port');
    const inputConfig = {
      type: 'input-int',
      min: 1,
      max: 65535,
      extra: t('Enter an integer value between 1 and 65535.'),
      hasRequiredCheck: true,
    };
    Object.assign(externalPortItem, inputConfig, {
      placeholder: t('Please input {label}', { label: externalPortItem.label }),
    });
    Object.assign(internalPortItem, inputConfig, {
      placeholder: t('Please input {label}', { label: internalPortItem.label }),
    });
    return items;
  }

  checkPortUsedBase = (pf, type, port, protocol) => {
    const {
      external_port,
      internal_port,
      external_port_range,
      internal_port_range,
    } = pf;
    const range =
      type === 'external' ? external_port_range : internal_port_range;
    if (range) {
      const [start, end] = this.getRangeFromString(range);
      return port >= start && port <= end && pf.protocol === protocol;
    }
    const pfPort = type === 'external' ? external_port : internal_port;
    return (
      this.item.id !== pf.id && port === pfPort && pf.protocol === protocol
    );
  };

  checkPortUsedInternal = (baseCheck, pf) => {
    if (!baseCheck) {
      return false;
    }
    const formData = this.formRef.current.getFieldsValue([
      'virtual_adapter',
      'fixed_ip_address',
    ]);
    const internalIpAddress =
      formData.fixed_ip_address.selectedRows[0].fixed_ip_address;
    const internalPortId = formData.virtual_adapter.selectedRows[0].id;
    return (
      this.item.id !== pf.id &&
      pf.internal_port_id === internalPortId &&
      pf.internal_ip_address === internalIpAddress
    );
  };
}

export default inject('rootStore')(observer(Edit));
