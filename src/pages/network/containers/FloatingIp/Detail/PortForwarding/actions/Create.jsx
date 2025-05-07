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
import { isNull, isObject } from 'lodash';
import { getCanReachSubnetIdsWithRouterIdInComponent } from 'resources/neutron/router';
import { PortStore } from 'stores/neutron/port-extension';
import {
  getPortFormItem,
  getPortsAndReasons,
  getPortsForPortFormItem,
} from 'resources/neutron/port';
import {
  getInterfaceWithReason,
  portForwardingProtocols,
  getPortForwardingName,
} from 'resources/neutron/floatingip';
import globalPortForwardingStore from 'stores/neutron/port-forwarding';
import { enablePFW } from 'resources/neutron/neutron';
import { regex } from 'utils/validate';
import { getOptions } from 'utils/index';

const { portRangeRegex } = regex;

export class CreatePortForwarding extends ModalAction {
  static id = 'create-port-forwarding';

  static title = t('Create Port Forwarding');

  get name() {
    return t('Create Port Forwarding');
  }

  get resource() {
    return t('port forwarding');
  }

  get resources() {
    return t('port forwardings');
  }

  init() {
    this.portStore = new PortStore();
    this.state = {
      ...this.state,
      alreadyUsedPorts: [],
      portFixedIPs: [],
      canReachSubnetIdsWithRouterId: [],
      routerIdWithExternalNetworkInfo: [],
      supportRange: true,
    };
    this.getPorts();
    this.getRangeSupport();
    this.getFipAlreadyUsedPorts();
    this.getExtraInfo();
  }

  getExtraInfo() {
    getCanReachSubnetIdsWithRouterIdInComponent.call(this, (router) => {
      const { item } = this;
      return (
        router.external_gateway_info &&
        router.external_gateway_info.network_id === item.floating_network_id
      );
    });
  }

  get fipId() {
    return this.item.id;
  }

  async getFipAlreadyUsedPorts() {
    const detail = await globalPortForwardingStore.fetchList({
      fipId: this.fipId,
    });
    this.setState({
      alreadyUsedPorts: detail || [],
    });
  }

  get instanceName() {
    return getPortForwardingName(
      this.submitData || this.values,
      this.item.floating_ip_address
    );
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

  static policy = 'create_floatingip_port_forwarding';

  static allowed = (item) => {
    return Promise.resolve(isNull(item.fixed_ip_address) && enablePFW());
  };

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
    if (external_port.includes(':')) {
      data.external_port_range = external_port;
    } else {
      data.external_port = external_port;
    }
    if (internal_port.includes(':')) {
      data.internal_port_range = internal_port;
    } else {
      data.internal_port = internal_port;
    }
    data.internal_ip_address = fixedIPAddressSelectedRows[0].fixed_ip_address;
    data.internal_port_id = selectedRows[0].id;
    this.submitData = data;
    return data;
  }

  onSubmit = (data) => {
    const { external_port_range, internal_port_range, ...rest } = data;
    if (!external_port_range || this.supportRange) {
      return globalPortForwardingStore.create({
        id: this.item.id,
        data,
      });
    }
    const externalPorts = this.getPortsByInput(external_port_range);
    const internalPorts = this.getPortsByInput(internal_port_range);
    const reqs = externalPorts.map((externalPort, index) => {
      return globalPortForwardingStore.create({
        id: this.item.id,
        data: {
          ...rest,
          external_port: externalPort,
          internal_port: internalPorts[index],
        },
      });
    });
    return Promise.all(reqs);
  };

  get nameForStateUpdate() {
    return ['protocol'];
  }

  get portDeviceOwner() {
    return ['compute:nova', ''];
  }

  getPorts() {
    getPortsForPortFormItem.call(this, this.portDeviceOwner);
  }

  async getRangeSupport() {
    try {
      await globalPortForwardingStore.fetchListByPage({
        limit: 1,
        fipId: this.fipId,
        external_port_range: '80:81',
      });
      this.setState({
        supportRange: true,
      });
    } catch (e) {
      console.log(e);
      this.setState({
        supportRange: false,
      });
    }
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
    return port === pfPort && pf.protocol === protocol;
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
      pf.internal_port_id === internalPortId &&
      pf.internal_ip_address === internalIpAddress
    );
  };

  checkPortUsed = (val, type) => {
    const { alreadyUsedPorts: usedPorts, protocol } = this.state;
    const port = parseInt(val, 10);
    return usedPorts.find((pf) => {
      const baseCheck = this.checkPortUsedBase(pf, type, port, protocol);
      return type === 'external'
        ? baseCheck
        : this.checkPortUsedInternal(baseCheck, pf);
    });
  };

  checkExtPortUsed = (val) => {
    return this.checkPortUsed(val, 'external');
  };

  getRangeFromString = (value) => {
    const tmp = (value || '').split(':');
    if (!tmp.length || tmp.length > 2) {
      return [];
    }
    const start = parseInt(tmp[0], 10);
    const end = parseInt(tmp[1], 10);
    return [start, end];
  };

  getPortForwardingContent = (item) => {
    const {
      external_port,
      external_port_range,
      internal_ip_address,
      internal_port,
      internal_port_range,
    } = item;
    return `${external_port || external_port_range} => ${internal_ip_address}:${
      internal_port || internal_port_range
    }`;
  };

  getUsedError = (items, name) => {
    if (items.length === 1 && isObject(items[0])) {
      return t(
        'The {name} has already been used by other {resource}({content}), please change.',
        {
          name,
          resource: this.resource,
          content: this.getPortForwardingContent(items[0]),
        }
      );
    }
    return t('The {name} {ports} have already been used, please change.', {
      name,
      ports: items.join(','),
    });
  };

  checkRangeInput = (input) => {
    const [start, end] = this.getRangeFromString(input);
    const length = end - start + 1;
    if (length <= 1) {
      return {
        error: t(
          'The value of the upper limit of the range must be greater than the value of the lower limit of the range.'
        ),
      };
    }
    if (length > this.maxRangeSize) {
      return { error: this.maxRangeSizeTip };
    }
    return {
      length,
      start,
      end,
    };
  };

  getPortsByRange = (start, length) => {
    return Array.from({ length }, (_, i) => start + i);
  };

  getPortsByInput = (input) => {
    const { length, start } = this.checkRangeInput(input);
    return this.getPortsByRange(start, length);
  };

  checkPortRangeUsed = (start, length, type) => {
    const ports = this.getPortsByRange(start, length);
    const usedPorts = ports.filter((port) => {
      if (type === 'external') {
        return this.checkExtPortUsed(port);
      }
      return this.checkInternalPortUsed(port);
    });
    if (usedPorts.length) {
      const name =
        type === 'external' ? t('external ports') : t('internal ports');
      return {
        error: this.getUsedError(usedPorts, name),
      };
    }
    return {
      ports,
      length,
    };
  };

  checkTwoRangeLength = (externalLength, internalLength) => {
    if (externalLength !== internalLength) {
      return t(
        'The size of the external port range is required to be the same as the size of the internal port range'
      );
    }
    return '';
  };

  checkExternalPortInput = (externalPortInput, internalPortInput) => {
    const externalIsRange = externalPortInput.includes(':');
    const internalIsRange = internalPortInput.includes(':');
    if (internalPortInput && externalIsRange !== internalIsRange) {
      return t('Ports are either single values or ranges');
    }
    if (!externalIsRange) {
      const ret = this.checkExtPortUsed(externalPortInput);
      if (ret) {
        return this.getUsedError([ret], t('external port'));
      }
      return '';
    }
    const {
      start,
      length,
      error: lengthError,
    } = this.checkRangeInput(externalPortInput);
    if (lengthError) {
      return lengthError;
    }
    const { error } = this.checkPortRangeUsed(start, length, 'external');
    if (error) {
      return error;
    }
    if (!portRangeRegex(internalPortInput)) {
      return '';
    }
    const { length: internalLength } = this.checkRangeInput(internalPortInput);
    if (!internalLength) {
      return '';
    }
    return this.checkTwoRangeLength(length, internalLength);
  };

  validateExternalPort = (rule, val) => {
    const value = val === undefined || val === null ? '' : `${val}`;
    const { internal_port: internalPort } = this.formRef.current.getFieldsValue(
      ['internal_port']
    );
    if (!portRangeRegex(value)) {
      return Promise.resolve(true);
    }
    const result = this.checkExternalPortInput(
      value,
      (internalPort || '').toString() || ''
    );
    if (result) {
      return Promise.reject(result);
    }
    return Promise.resolve(true);
  };

  checkInternalPortUsed = (val) => {
    return this.checkPortUsed(val, 'internal');
  };

  checkInternalPortInput = (externalPortInput, internalPortInput) => {
    const externalIsRange = externalPortInput.includes(':');
    const internalIsRange = internalPortInput.includes(':');
    if (externalPortInput && externalIsRange !== internalIsRange) {
      return t('Ports are either single values or ranges');
    }
    if (!internalIsRange) {
      const ret = this.checkInternalPortUsed(internalPortInput);
      if (ret) {
        return this.getUsedError([ret], t('internal port'));
      }
      return '';
    }
    const {
      start,
      length,
      error: lengthError,
    } = this.checkRangeInput(internalPortInput);
    if (lengthError) {
      return lengthError;
    }
    const { error } = this.checkPortRangeUsed(start, length, 'internal');
    if (error) {
      return error;
    }
    if (!portRangeRegex(externalPortInput)) {
      return '';
    }
    const { length: externalLength } = this.checkRangeInput(externalPortInput);
    if (!externalLength) {
      return '';
    }
    return this.checkTwoRangeLength(length, externalLength);
  };

  validateInternalPort = (_, val) => {
    const value = val === undefined || val === null ? '' : `${val}`;
    if (!portRangeRegex(value)) {
      return Promise.resolve(true);
    }
    const { external_port: externalPort } = this.formRef.current.getFieldsValue(
      ['external_port']
    );
    const result = this.checkInternalPortInput(
      (externalPort || '').toString() || '',
      value
    );
    if (result) {
      return Promise.reject(result);
    }
    return Promise.resolve();
  };

  onFixedIpChange = (e) => {
    this.setState(
      {
        fixed_ip_address: e,
      },
      () => {
        this.formRef.current.resetFields(['internal_port']);
      }
    );
  };

  get supportRange() {
    const { supportRange } = this.state;
    return supportRange;
  }

  get maxRangeSize() {
    if (this.supportRange) {
      return Infinity;
    }
    return 20;
  }

  get maxRangeSizeTip() {
    return t(
      'The maximum batch size is {size}, that is, the size of the port range cannot exceed {size}.',
      { size: this.maxRangeSize }
    );
  }

  get tips() {
    return (
      <div>
        <p>
          {t('1. You can create {resources} using ports or port ranges.', {
            resources: this.resources,
          })}
        </p>
        <p>
          {t(
            '2. In the same protocol, you cannot create multiple {resources} for the same source port or source port range.',
            {
              resources: this.resources,
            }
          )}
        </p>
        <p>
          {t(
            '3. When using a port range to create a port mapping, the size of the external port range is required to be the same as the size of the internal port range. For example, the external port range is 80:90 and the internal port range is 8080:8090.'
          )}
        </p>
        {!this.supportRange && (
          <p>
            {t(
              '4. When you use a port range to create {resources}, multiple {resources} will be created in batches. ',
              {
                resources: this.resources,
              }
            ) + this.maxRangeSizeTip}
          </p>
        )}
      </div>
    );
  }

  get formItems() {
    const { fixed_ip_address = { selectedRows: [] } } = this.state;
    const externalPortExtra = t(
      'Input external port or port range (example: 80 or 80:160)'
    );
    const internalPortExtra = t(
      'Input internal port or port range (example: 80 or 80:160)'
    );
    const ret = [
      {
        name: 'floatingIp',
        label: t('Floating Ip'),
        type: 'label',
        iconType: 'floatingIp',
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        options: getOptions(portForwardingProtocols),
        required: true,
      },
      {
        name: 'external_port',
        label: t('External Port/Port Range'),
        type: 'port-range',
        required: true,
        validator: this.validateExternalPort,
        dependencies: ['protocol', 'internal_port'],
        placeholder: externalPortExtra,
        extra: externalPortExtra,
        hasRequiredCheck: false,
      },
      {
        name: 'internal_port',
        label: t('Internal Port/Port Range'),
        type: 'port-range',
        hidden: fixed_ip_address.selectedRows.length === 0,
        required: true,
        validator: this.validateInternalPort,
        dependencies: ['protocol', 'external_port'],
        placeholder: internalPortExtra,
        extra: internalPortExtra,
        hasRequiredCheck: false,
      },
    ];
    const [virtualAdapterItem, fixedIpItem] = getPortFormItem.call(this);
    virtualAdapterItem.label = t('Target Port');
    fixedIpItem.label = t('Target IP Address');
    fixedIpItem.onChange = this.onFixedIpChange;

    ret.splice(4, 0, ...[virtualAdapterItem, fixedIpItem]);
    return ret;
  }
}

export default inject('rootStore')(observer(CreatePortForwarding));
