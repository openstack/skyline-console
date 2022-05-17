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
import { toJS } from 'mobx';
import { RouterStore } from 'stores/neutron/router';
import globalSubnetStore from 'stores/neutron/subnet';
import { PortStore } from 'stores/neutron/port';
import { ModalAction } from 'containers/Action';

export class ConnectSubnet extends ModalAction {
  static id = 'connect-subnet';

  static title = t('Connect Subnet');

  init() {
    this.store = new RouterStore();
    this.subnetStore = globalSubnetStore;
    this.portStore = new PortStore();
    this.getPortList();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('connect subnet');
  }

  getSubnets = () => {
    const { networkId } = this.state;
    if (!networkId) {
      return;
    }
    this.subnetStore.fetchList({ network_id: networkId });
  };

  get subnets() {
    const { networkId } = this.state;
    if (!networkId) {
      return [];
    }
    return toJS(this.subnetStore.list.data || []);
  }

  getPortList() {
    const { id } = this.item;
    this.portStore.fetchList({ device_id: id });
  }

  get excludeSubnetIds() {
    const excludeSubnetIds = [];
    toJS(this.portStore.list.data || []).forEach((port) => {
      port.fixed_ips.forEach((it) => {
        excludeSubnetIds.push(it.subnet_id);
      });
    });
    return excludeSubnetIds;
  }

  onNetworkChange = (value) => {
    const { selectedRowKeys = [] } = value;
    this.setState(
      {
        networkId: selectedRowKeys[0],
      },
      () => {
        this.getSubnets();
      }
    );
  };

  static policy = 'add_router_interface';

  static allowed = () => Promise.resolve(true);

  disabledFuncSubnet = (record) => {
    const { allocation_pools = [] } = record;
    if (allocation_pools.length === 0) {
      return true;
    }
    return this.excludeSubnetIds.indexOf(record.id) >= 0;
  };

  get formItems() {
    const { networkId } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'router',
      },
      {
        name: 'network',
        label: t('Network'),
        type: 'network-select-table',
        required: true,
        onChange: this.onNetworkChange,
      },
      {
        name: 'subnet',
        label: t('Subnet'),
        type: 'select-table',
        data: this.subnets,
        isLoading: networkId && this.subnetStore.list.isLoading,
        disabledFunc: this.disabledFuncSubnet,
        required: true,
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
            render: (value) => {
              if (!value || value.length === 0) {
                return '-';
              }
              return `${value[0].start} -- ${value[0].end}`;
            },
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'sinceTime',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { subnet } = values;
    const subnetId = subnet.selectedRowKeys[0];
    const { networkId } = this.state;
    return this.store.connectSubnet({ id, subnetId, networkId });
  };
}

export default inject('rootStore')(observer(ConnectSubnet));
