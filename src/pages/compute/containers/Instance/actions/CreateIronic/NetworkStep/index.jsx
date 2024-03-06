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
import { Button } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { isEmpty, isArray } from 'lodash';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';
import { SecurityGroupStore } from 'stores/neutron/security-group';
import { ipValidate } from 'utils/validate';
import Base from 'components/Form';
import NetworkSelect from 'components/FormItem/NetworkSelect';
import { ipTypeOptions } from 'resources/neutron/network';
import {
  securityGroupColumns,
  securityGroupFilter,
} from 'resources/neutron/security-group';
import { getLinkRender } from 'utils/route-map';

// import EditYamlModal from 'components/Modals/EditYaml';
const { isIPv4, isIpv6 } = ipValidate;

export class NetworkStep extends Base {
  init() {
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
    this.securityGroupStore = new SecurityGroupStore();
    this.subnetMap = {};
  }

  get title() {
    return 'NetworkStep';
  }

  get name() {
    return 'NetworkStep';
  }

  get defaultValue() {
    const data = {
      networks: [],
    };
    return data;
  }

  allowed = () => Promise.resolve();

  getSubnetPromise = async (networkId) => {
    if (!this.subnetMap[networkId]) {
      const result = await this.subnetStore.fetchList({
        network_id: networkId,
      });
      this.subnetMap[networkId] = result;
    }
    return this.subnetMap[networkId];
  };

  async getSubnets() {
    const { networkSelectRows, networks = [] } = this.state;
    const results = await Promise.all(
      networkSelectRows.map((it) => this.getSubnetPromise(it.id))
    );
    const subnets = [];
    results.forEach((result) => {
      subnets.push(...result);
    });
    const usedIndex = [];
    const initValue = networkSelectRows.map((network, index) => {
      const subnet = subnets.find((it) => it.network_id === network.id);
      const item = networks.find((it, networkIndex) => {
        if (it.value.network === network.id) {
          usedIndex.push(networkIndex);
          return true;
        }
        return false;
      });
      if (item) {
        return item;
      }
      return {
        value: {
          network: network.id,
          subnet: subnet.id,
          networkOption: network,
          subnetOption: subnet,
          ipTypeOption: ipTypeOptions[0],
          ipType: 0,
        },
        index,
      };
    });
    const networkIds = networkSelectRows.map((it) => it.id);
    networks.forEach((it, index) => {
      if (
        usedIndex.indexOf(index) < 0 &&
        networkIds.indexOf(it.value.network) >= 0
      ) {
        initValue.push(it);
      }
    });
    this.updateFormValue('networks', initValue);
    this.setState({
      subnets,
      initValue,
    });
  }

  checkNetworks = (value) => {
    if (!isArray(value) || isEmpty(value) || isEmpty(value[0].value)) {
      return false;
    }
    const item = value.find((it) => !it.value || !it.value.network);
    if (item) {
      return false;
    }
    const ipError = value.find(
      (it) =>
        it.value.ipType === 1 && !isIPv4(it.value.ip) && !isIpv6(it.value.ip)
    );
    if (ipError) {
      return false;
    }
    return true;
  };

  disabledNetwork = (it) => !it.subnets || it.subnets.length === 0;

  onNetworkChange = (value) => {
    const { selectedRows } = value;
    this.setState(
      {
        networkSelectRows: selectedRows,
      },
      () => {
        this.getSubnets();
      }
    );
    this.updateContext({
      networkSelectRows: selectedRows,
    });
  };

  get nameForStateUpdate() {
    return ['networkSelect', 'networks'];
  }

  get formItems() {
    const { networkSelectRows = [], subnets, initValue = [] } = this.state;
    const showNetworks = networkSelectRows.length > 0;
    const showSecurityGroups =
      networkSelectRows.length &&
      networkSelectRows.every((it) => it.port_security_enabled);
    return [
      {
        name: 'networkSelect',
        label: t('Networks'),
        type: 'network-select-table',
        disabledFunc: this.disabledNetwork,
        onChange: this.onNetworkChange,
        showExternal: true,
        isMulti: false,
        required: true,
        header: (
          <div>
            {t(
              'Please reasonably plan the network and subnet to which the virtual network card belongs.'
            )}
            {t(' You can go to the console to ')}
            {getLinkRender({
              key: 'network',
              value: `${t('create a new network/subnet')} > `,
              extra: { target: '_blank' },
            })}
          </div>
        ),
      },
      {
        name: 'networks',
        label: t('Virtual LAN'),
        type: 'add-select',
        networks: networkSelectRows,
        hidden: !showNetworks,
        subnets,
        itemComponent: NetworkSelect,
        required: showNetworks,
        addTextTips: t('Virtual LANs'),
        addText: t('Add Virtual LAN'),
        minCount: networkSelectRows.length || 0,
        optionsByIndex: true,
        initValue,
        validator: (rule, value) => {
          if (!this.checkNetworks(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('');
          }
          return Promise.resolve();
        },
      },
      {
        name: 'ipv6',
        label: 'IPv6',
        type: 'label',
        hidden: true,
        content: (
          <span>
            {t('The selected VPC/subnet does not have IPv6 enabled.')}{' '}
            <Button type="link">
              {t('To open')} <FormOutlined />
            </Button>{' '}
          </span>
        ),
      },
      {
        type: 'divider',
      },
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        tip: t(
          'Each instance belongs to at least one security group, which needs to be specified when it is created. Instances in the same security group can communicate with each other on the network, and instances in different security groups are disconnected from the internal network by default.'
        ),
        backendPageStore: this.securityGroupStore,
        extraParams: { project_id: this.currentProjectId },
        required: showSecurityGroups,
        hidden: !showSecurityGroups,
        isMulti: true,
        header: (
          <div style={{ marginBottom: 8 }}>
            {t(
              'The security group is similar to the firewall function and is used to set up network access control. '
            )}
            {t(' You can go to the console to ')}
            {getLinkRender({
              key: 'securityGroup',
              value: `${t('create a new security group')}> `,
            })}
            {t(
              'Note: The security group you use will act on all virtual adapters of the instance.'
            )}
          </div>
        ),
        filterParams: securityGroupFilter,
        columns: securityGroupColumns,
      },
    ];
  }
}

export default inject('rootStore')(observer(NetworkStep));
