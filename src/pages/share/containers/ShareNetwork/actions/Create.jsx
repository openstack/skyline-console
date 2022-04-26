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
import globalShareNetworkStore from 'stores/manila/share-network';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Share Network');

  get name() {
    return t('create share network');
  }

  init() {
    this.store = globalShareNetworkStore;
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
  }

  static policy = 'manila:share_network:create';

  static allowed = () => Promise.resolve(true);

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get subnets() {
    const { networkId } = this.state;
    if (!networkId) {
      return [];
    }
    return this.subnetStore.list.data || [];
  }

  getSubnets() {
    const { networkId } = this.state;
    if (!networkId) {
      return;
    }
    this.subnetStore.fetchList({ network_id: networkId });
  }

  onNetworkChange = (value) => {
    const { selectedRowKeys = [] } = value;
    if (selectedRowKeys.length === 0) {
      return;
    }
    this.setState(
      {
        networkId: selectedRowKeys[0],
      },
      () => {
        this.getSubnets();
      }
    );
  };

  get nameForStateUpdate() {
    return ['network'];
  }

  get formItems() {
    const { networkId } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
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
    const { network, subnet, ...rest } = values;
    const body = {
      neutron_net_id: network.selectedRowKeys[0],
      neutron_subnet_id: subnet.selectedRowKeys[0],
      ...rest,
    };
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
