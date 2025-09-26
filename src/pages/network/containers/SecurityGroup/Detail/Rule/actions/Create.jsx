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
import globalSecurityGroupRuleStore from 'stores/neutron/security-rule';
import globalSecurityGroupStore from 'stores/neutron/security-group';
import globalProjectStore from 'stores/keystone/project';
import { ipProtocols } from 'resources/neutron/security-group-rule';
import { has } from 'lodash';
import { cidrAllValidate } from 'utils/validate';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Rule');

  constructor(props) {
    super(props);
    this.state = {
      protocol: this.protocolList[0].value,
      portOrRange: 'range',
      remoteType: 'cidr',
      direction: 'ingress',
      ipProtocol: 'ah',
    };
  }

  get name() {
    return t('Create rule');
  }

  init() {
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.store = globalSecurityGroupRuleStore;
    this.groupStore = globalSecurityGroupStore;
    this.projectStore = globalProjectStore;
    this.getAllGroups();
    this.getQuota();
  }

  static policy = 'create_security_group_rule';

  static allowed = () => Promise.resolve(true);

  get messageHasItemName() {
    return false;
  }

  async getAllGroups() {
    const cb = await globalSecurityGroupStore.fetchList();
    this.allGroups = cb.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }

  static get disableSubmit() {
    const { neutronQuota: { security_group_rule: { left = 0 } = {} } = {} } =
      globalProjectStore;
    return left === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    const result = await this.projectStore.fetchProjectNeutronQuota();
    const { security_group_rule: quota = {} } = result || {};
    this.setState({
      quota,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { left = 0 } = quota || {};
    const add = left === 0 ? 0 : 1;
    const data = {
      ...quota,
      add,
      name: 'security_group_rule',
      title: t('Security Group Rule'),
    };
    return [data];
  }

  get defaultRules() {
    return {
      custom_tcp: {
        name: t('Custom TCP Rule'),
        ip_protocol: 'tcp',
      },
      custom_udp: {
        name: t('Custom UDP Rule'),
        ip_protocol: 'udp',
      },
      custom_icmp: {
        name: t('Custom ICMP Rule'),
        ip_protocol: 'icmp',
      },
      all_proto: {
        name: t('All Proto'),
        ip_protocol: null,
      },
      all_tcp: {
        name: t('All TCP'),
        ip_protocol: 'tcp',
        from_port: '1',
        to_port: '65535',
      },
      all_udp: {
        name: t('All UDP'),
        ip_protocol: 'udp',
        from_port: '1',
        to_port: '65535',
      },
      all_icmp: {
        name: t('All ICMP'),
        ip_protocol: 'icmp',
      },
      custom_protocol: {
        name: t('Other Protocol'),
      },
    };
  }

  get protocolList() {
    const options = [];
    Object.keys(this.defaultRules).forEach((key) => {
      options.push({ value: key, label: this.defaultRules[key].name });
    });
    return options;
  }

  get ruleList() {
    return Object.assign(this.defaultRules, this.settingRules);
  }

  get defaultValue() {
    const { protocol, ...rest } = this.state;
    const { from_port, to_port } = this.ruleList[protocol];
    let { sourcePort = '' } = this.state;
    if (from_port) {
      sourcePort =
        from_port !== to_port ? `${from_port}:${to_port}` : from_port;
    }
    const value = {
      ...rest,
      protocol,
      sourcePort,
    };
    return value;
  }

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'portOrRange')) {
      this.setState(
        {
          sourcePort: '',
        },
        () => {
          this.updateDefaultValue();
        }
      );
    }
    if (has(changedFields, 'remoteType')) {
      this.setState(
        {
          remote_ip_prefix: '',
          remote_group_id: '',
        },
        () => {
          this.updateDefaultValue();
        }
      );
    }
    this.setState({
      ...changedFields,
    });
  };

  handleDirectionChange = (direction) => {
    this.setState({
      direction,
    });
  };

  get formItems() {
    const { protocol, portOrRange, remoteType, direction } = this.state;
    const isCustomProtocol = protocol === 'custom_protocol';
    const isCustomIcmp = protocol === 'custom_icmp';
    const showPortType = ['custom_udp', 'custom_tcp'].includes(protocol);
    const showRemoteType = ['custom_udp', 'custom_tcp', 'custom_icmp'].includes(
      protocol
    );
    const showSourcePort = showPortType && portOrRange === 'range';
    const showRemoteIpPrefix = showRemoteType && remoteType === 'cidr';
    const showSgAndEther = showRemoteType && remoteType === 'sg';

    return [
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        required: true,
        options: this.protocolList,
      },
      {
        name: 'direction',
        label: t('Direction'),
        type: 'select',
        required: true,
        options: [
          { value: 'ingress', label: t('Ingress') },
          { value: 'egress', label: t('Egress') },
        ],
        onChange: this.handleDirectionChange,
      },
      {
        name: 'ethertype',
        label: t('Ether Type'),
        type: 'select',
        required: true,
        options: [
          { value: 'IPv4', label: t('IPv4') },
          { value: 'IPv6', label: t('IPv6') },
        ],
      },
      {
        name: 'portOrRange',
        label: t('Port Type'),
        type: 'select',
        required: showPortType,
        options: [
          { value: 'all', label: t('All Port') },
          { value: 'range', label: t('Custom') },
        ],
        hidden: !showPortType,
      },
      {
        name: 'sourcePort',
        label: t('Port or Port Range'),
        extra:
          direction === 'egress'
            ? t('Input destination port or port range (example: 80 or 80:160)')
            : t('Input source port or port range (example: 80 or 80:160)'),
        type: 'port-range',
        required: showSourcePort,
        hidden: !showSourcePort,
      },
      {
        name: 'ipProtocol',
        label: t('IP Protocol'),
        type: 'select-input',
        options: ipProtocols,
        required: isCustomProtocol,
        hidden: !isCustomProtocol,
        formRef: this.formRef,
        help: t('Please input protocol number if it absent in select list.'),
      },
      {
        name: 'icmpType',
        label: t('ICMP Type'),
        type: 'input-int',
        min: 0,
        max: 255,
        required: false,
        hidden: !isCustomIcmp,
        help: t('Please input ICMP type(0-255)'),
      },
      {
        name: 'icmpCode',
        label: t('ICMP Code'),
        type: 'input-int',
        min: 0,
        max: 255,
        required: false,
        hidden: !isCustomIcmp,
        help: t('Please input ICMP code(0-255)'),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
        placeholder: t('Description for this rule'),
      },
      {
        name: 'remoteType',
        label: t('Remote Type'),
        type: 'select',
        required: showRemoteType,
        options: [
          { value: 'cidr', label: t('cidr') },
          { value: 'sg', label: t('Security Group') },
        ],
        hidden: !showRemoteType,
      },
      {
        name: 'remote_ip_prefix',
        label: t('Remote IP Prefix'),
        type: 'input',
        hidden: !showRemoteIpPrefix,
        required: showRemoteIpPrefix,
        validator: showRemoteIpPrefix ? cidrAllValidate : null,
        placeholder: t('Please input IPv4 or IPv6 cidr'),
        extra: t(
          'Please input IPv4 or IPv6 cidr, (e.g. 192.168.0.0/24, 2001:DB8::/48)'
        ),
      },
      {
        name: 'remote_group_id',
        label: t('Remote Security Group'),
        type: 'select',
        required: showSgAndEther,
        hidden: !showSgAndEther,
        options: this.allGroups,
      },
    ];
  }

  onSubmit = (values, containerProps) => {
    const { match: { params: { id } = {} } = {} } = containerProps;
    const {
      sourcePort,
      protocol,
      ipProtocol,
      icmpType,
      icmpCode,
      portOrRange,
      remoteType,
      ...rest
    } = values;
    const range =
      ['custom_udp', 'custom_tcp'].includes(protocol) &&
      portOrRange === 'range';
    const ports = sourcePort.split(':');
    const newProtocol =
      protocol !== 'custom_protocol'
        ? this.defaultRules[protocol].ip_protocol
        : ipProtocol;
    const modalValue = {
      security_group_id: id || this.item.id,
      port_range_min:
        protocol === 'custom_icmp'
          ? icmpType
          : range
          ? parseInt(ports[0], 10)
          : null,
      port_range_max:
        protocol === 'custom_icmp'
          ? icmpCode
          : range
          ? parseInt(ports[1] || ports[0], 10)
          : null,
      protocol: newProtocol,
      ...rest,
    };
    if (protocol.includes('all')) {
      delete modalValue.remote_ip_prefix;
      delete modalValue.remote_group_id;
    }
    return this.store.create(modalValue);
  };
}

export default inject('rootStore')(observer(Create));
