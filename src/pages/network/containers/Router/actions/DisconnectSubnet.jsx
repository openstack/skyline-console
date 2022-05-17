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
import globalNetworkStore from 'stores/neutron/network';
import globalSubnetStore from 'stores/neutron/subnet';
import { PortStore } from 'stores/neutron/port';
import { ModalAction } from 'containers/Action';

export class DisconnectSubnet extends ModalAction {
  static id = 'disconnect-subnet';

  static title = t('Disconnect Subnet');

  init() {
    this.store = new RouterStore();
    this.networkStore = globalNetworkStore;
    this.subnetStore = globalSubnetStore;
    this.portStore = new PortStore();
    this.getSubnetList();
    this.state.subnetLoading = true;
  }

  static policy = 'remove_router_interface';

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('disconnect subnet');
  }

  async getSubnetList() {
    const { id } = this.item;
    await this.portStore.fetchList({ device_id: id });
    const subnetIds = [];
    const networkIds = [];
    const routerInterfaceList = [
      'network:router_interface_distributed',
      'network:router_interface',
      'network:ha_router_replicated_interface',
    ];
    toJS(this.portStore.list.data || []).forEach((port) => {
      if (routerInterfaceList.indexOf(port.device_owner) > -1) {
        networkIds.push(port.network_id);
        port.fixed_ips.forEach((ip) => {
          subnetIds.push(ip.subnet_id);
        });
      }
    });
    const subnets = await Promise.all(
      Array.from(new Set(subnetIds)).map((it) =>
        this.subnetStore.fetchDetail({ id: it })
      )
    );
    const networks = await Promise.all(
      Array.from(new Set(networkIds)).map((it) =>
        this.networkStore.fetchDetail({ id: it })
      )
    );
    subnets.forEach((it) => {
      const network = networks.find((net) => net.id === it.network_id);
      it.network = network;
    });
    this.setState({
      subnets: subnets.map((it) => toJS(it)),
      subnetLoading: false,
    });
  }

  static allowed = () => Promise.resolve(true);

  get formItems() {
    const { subnets = [], subnetLoading } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'router',
      },
      {
        name: 'subnet',
        label: t('Subnet'),
        type: 'select-table',
        data: subnets,
        isLoading: subnetLoading,
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
            title: t('Network'),
            dataIndex: 'network',
            render: (value) => (value && value.name) || '-',
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
    return this.store.disconnectSubnet({ id, subnetId });
  };
}

export default inject('rootStore')(observer(DisconnectSubnet));
