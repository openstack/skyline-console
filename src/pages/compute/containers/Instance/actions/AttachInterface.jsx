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
import globalServerStore from 'stores/nova/instance';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';
import { ModalAction } from 'containers/Action';
import {
  isActiveOrShutOff,
  isNotLocked,
  isNotDeleting,
} from 'resources/nova/instance';
import { ipValidate } from 'utils/validate';

const { isIPv4, isIpv6, isIpInRangeAll } = ipValidate;

export class AttachInterface extends ModalAction {
  static id = 'attach-interface';

  static title = t('Attach Interface');

  init() {
    this.store = globalServerStore;
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('attach interface');
  }

  // get networks() {
  //   return (this.networkStore.list.data || []).filter(it => it.subnets && it.subnets.length > 0);
  // }

  get subnets() {
    return this.subnetStore.list.data || [];
  }

  getSubnets(networkId) {
    this.subnetStore.fetchList({ network_id: networkId });
  }

  get tips() {
    return (
      <>
        {t(
          'After attaching interface, you may need to login the instance to update the network interface configuration and restart the network service.'
        )}
        <br />
        {t(
          'The port created here will be automatically deleted when detach. If you need a reusable port, please go to the Virtual Adapter page to create and attach the port to instance.'
        )}{' '}
      </>
    );
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      snapshot: '',
      ipType: 0,
    };
    return value;
  }

  static policy = 'os_compute_api:os-attach-interfaces:create';

  static allowed = (item, containerProps) => {
    const { isAdminPage = false } = containerProps;
    return Promise.resolve(
      !isAdminPage &&
        isActiveOrShutOff(item) &&
        isNotLocked(item) &&
        isNotDeleting(item)
    );
  };

  get nameForStateUpdate() {
    return ['network', 'ipType', 'subnet'];
  }

  get ipTypeOptions() {
    return [
      {
        label: t('Automatically Assigned Address'),
        value: 0,
      },
      {
        label: t('Manually Assigned Address'),
        value: 1,
      },
    ];
  }

  checkIP = (rule, value) => {
    if (!value || (!isIPv4(value) && !isIpv6(value))) {
      return Promise.reject(t('Please input a valid ip!'));
    }
    const { allocation_pools: pools } = this.state.subnet || {};
    if (pools) {
      const okPool = pools.find((pool) =>
        isIpInRangeAll(value, pool.start, pool.end)
      );
      if (!okPool) {
        return Promise.reject(t('The ip is not within the allocated pool!'));
      }
    }
    return Promise.resolve();
  };

  disabledNetwork = (it) => !it.subnets || it.subnets.length === 0;

  onNetworkChange = (value) => {
    const { selectedRowKeys = [] } = value;
    if (selectedRowKeys.length === 0) {
      return;
    }
    this.getSubnets(selectedRowKeys[0]);
  };

  get formItems() {
    const { ipType, subnet } = this.state;
    const isManua = ipType === 1;
    const version = (subnet && subnet.ip_version) || 4;
    // const defaultIp = getIpInitValue(subnet);
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'network',
        label: t('Network'),
        type: 'network-select-table',
        showExternal: true,
        required: true,
        disabledFunc: this.disabledNetwork,
        onChange: this.onNetworkChange,
      },
      {
        name: 'ipType',
        label: t('Set IP'),
        type: 'radio',
        options: this.ipTypeOptions,
      },
      {
        name: 'subnet',
        label: t('Subnet'),
        type: 'select-table',
        required: isManua,
        data: this.subnets,
        isLoading: this.subnetStore.list.isLoading,
        hidden: !isManua,
        isMulti: false,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Cidr'),
            dataIndex: 'cidr',
          },
          {
            title: t('Allocation Pools'),
            dataIndex: 'allocation_pools',
            render: (value) =>
              value.length ? `${value[0].start} -- ${value[0].end}` : '-',
          },
        ],
      },
      {
        name: 'ip',
        label: t('Given IP'),
        type: 'ip-input',
        required: ipType === 1,
        hidden: ipType !== 1,
        version,
        // defaultIp,
        validator: this.checkIP,
        extra: t('Please make sure this IP address be available.'),
      },
    ];
  }

  onSubmit = (values) => {
    const { network, ip, ipType } = values;
    const { id } = this.item;
    const networkId = network.selectedRowKeys[0];
    const innerBody = {
      net_id: networkId,
    };
    if (ipType === 1) {
      innerBody.fixed_ips = [
        {
          ip_address: ip,
        },
      ];
    }
    const body = {
      interfaceAttachment: innerBody,
    };
    return this.store.addInterface({ id, body });
  };
}

export default inject('rootStore')(observer(AttachInterface));
