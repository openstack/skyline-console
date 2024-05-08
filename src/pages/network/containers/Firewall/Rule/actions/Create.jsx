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
import { FormAction } from 'containers/Action';
import { isUndefined } from 'lodash';
import globalFirewallRuleStore, {
  FirewallRuleStore,
} from 'stores/neutron/firewall-rule';
import { actionInfos, protocolInfos } from 'resources/neutron/firewall-rule';
import { ipValidate } from 'utils/validate';
import { toJS } from 'mobx';
import { checkPolicyRule } from 'resources/skyline/policy';
import {
  fetchNeutronQuota,
  getQuotaInfo,
  checkQuotaDisable,
} from 'resources/neutron/network';

const quotaKeys = ['firewall_rule'];
const wishes = [1];

const { isIpCidr, isIPv6Cidr, isIPv4, isIpv6 } = ipValidate;

export class CreateForm extends FormAction {
  init() {
    this.store = new FirewallRuleStore();
    this.getDetail();
    fetchNeutronQuota(this);
  }

  static id = 'rule-create';

  static title = t('Create Rule');

  static path = '/network/firewall-rule/create';

  get listUrl() {
    return this.getRoutePath('firewall', null, { tab: 'rules' });
  }

  get isEdit() {
    return this.params && !!this.params.id;
  }

  get name() {
    return this.isEdit ? t('Edit rule') : t('Create rule');
  }

  get id() {
    return this.params.id;
  }

  static policy = 'create_firewall_rule';

  static allowed() {
    return Promise.resolve(true);
  }

  get disableSubmit() {
    if (this.isEdit) {
      return false;
    }
    return checkQuotaDisable(quotaKeys, wishes);
  }

  get showQuota() {
    return !this.isEdit;
  }

  get quotaInfo() {
    return getQuotaInfo(this, quotaKeys, wishes);
  }

  get defaultValue() {
    if (this.id) {
      const data = toJS(this.store.detail);
      return {
        ...data,
        options: {
          enabled: data.enabled,
          shared: data.shared,
        },
      };
    }
    return {
      protocol: 'tcp',
      action: 'allow',
      ip_version: 4,
      options: {
        enabled: true,
        shared: false,
      },
    };
  }

  get protocolList() {
    return Object.keys(protocolInfos).map((key) => ({
      value: key,
      label: protocolInfos[key],
    }));
  }

  get actionList() {
    return Object.keys(actionInfos).map((key) => ({
      value: key,
      label: actionInfos[key],
    }));
  }

  get ipVersionList() {
    return [
      { value: 4, label: t('IPv4') },
      { value: 6, label: t('IPv6') },
    ];
  }

  async getDetail() {
    if (this.params.id) {
      await this.store.fetchDetail(this.params);
      this.updateDefaultValue();
      this.updateState();
    }
  }

  checkIp = (type) => (rule, value) => {
    const name = type === 'source' ? t('Source IP') : t('Destination IP');
    if (!value) {
      return Promise.resolve();
    }
    const ip = value.trim();
    if (isUndefined(value) || ip.length === 0) {
      return Promise.resolve();
    }
    const { ip_version = 4 } = this.state;
    const isIpv4 = ip_version === 4;
    if (isIpv4 && !(isIpCidr(ip) || isIPv4(ip))) {
      return Promise.reject(
        t('{ name } Format Error (e.g. 192.168.1.1 or 192.168.1.1/24)', {
          name,
        })
      );
    }
    if (!isIpv4 && !(isIPv6Cidr(ip) || isIpv6(ip))) {
      return Promise.reject(
        t(
          '{ name } Format Error (e.g. FE80:0:0:0:0:0:0:1 or FE80:0:0:0:0:0:0:1/10)',
          { name }
        )
      );
    }
    return Promise.resolve();
  };

  checkSourceIp = () => this.checkIp('source');

  checkDestinationIp = () => this.checkIp('destination');

  canChangeShared = () => {
    const result = checkPolicyRule('update_firewall_rule:shared');
    if (!result) {
      return false;
    }
    if (this.id) {
      const detail = toJS(this.store.detail);
      return (detail.policies || []).every((it) => !it.shared);
    }
    return true;
  };

  get formItems() {
    const { protocol } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        // type: 'input-name',
        required: true,
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'radio',
        options: this.protocolList,
        required: true,
      },
      {
        name: 'action',
        label: t('Rule Action'),
        type: 'select',
        options: this.actionList,
        required: true,
      },
      {
        name: 'ip_version',
        label: t('IP Version'),
        type: 'radio',
        options: this.ipVersionList,
      },
      {
        name: 'source_ip_address',
        label: t('Source IP Address/Subnet'),
        type: 'input',
        validator: this.checkSourceIp(),
      },
      {
        name: 'source_port',
        label: t('Source Port/Port Range'),
        // TODO
        type: 'port-range',
        hidden: ['any', 'icmp'].includes(protocol),
      },
      {
        name: 'destination_ip_address',
        label: t('Destination IP Address/Subnet'),
        type: 'input',
        validator: this.checkDestinationIp(),
      },
      {
        name: 'destination_port',
        label: t('Destination Port/Port Range'),
        type: 'input',
        help: t('Input destination port or port range (example: 80 or 80:160)'),
        hidden: ['any', 'icmp'].includes(protocol),
      },
      {
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          { label: t('Enabled'), value: 'enabled' },
          {
            label: t('Shared'),
            value: 'shared',
            disabled: !this.canChangeShared(),
          },
        ],
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const {
      options: { enabled, shared },
      protocol,
      destination_ip_address,
      source_ip_address,
      source_port,
      destination_port,
      ...rest
    } = values;
    const body = {
      ...rest,
      enabled,
      // shared,
      protocol: protocol === 'any' ? null : protocol,
      destination_ip_address: destination_ip_address || null,
      source_ip_address: source_ip_address || null,
      source_port: source_port || null,
      destination_port: destination_port || null,
    };
    if (this.canChangeShared()) {
      body.shared = shared;
    }
    if (!this.id) {
      return globalFirewallRuleStore.create(body);
    }
    return globalFirewallRuleStore.edit({ id: this.id }, body);
  };
}

export default inject('rootStore')(observer(CreateForm));
