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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';
import globalLoadBalancerFlavorStore from 'stores/octavia/flavor';
import globalLoadBalancerProviderStore from 'stores/octavia/provider';
import { LbaasStore } from 'stores/octavia/loadbalancer';

export class BaseStep extends Base {
  init() {
    this.store = new LbaasStore();
    this.flavorStore = globalLoadBalancerFlavorStore;
    this.providerStore = globalLoadBalancerProviderStore;
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
    this.state = {
      providerList: [],
      provider: 'amphora',
      providersLoaded: false,
    };
    this.getFlavors();
    this.getProviders();
  }

  get title() {
    return 'BaseStep';
  }

  get name() {
    return 'BaseStep';
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    const { providerList = [] } = this.state;
    const defaultProvider =
      providerList.find((p) => p.value === 'amphora') || providerList[0];
    return {
      project_id: this.props.rootStore.user.project.id,
      admin_state_enabled: true,
      provider: defaultProvider?.value || 'amphora',
    };
  }

  allowed = () => Promise.resolve();

  handleOwnedNetworkChange = (value) => {
    const { network_id: old_network_id } = this.state;
    const new_network_id = value.selectedRowKeys[0];
    this.setState(
      {
        network_id: new_network_id,
      },
      () => {
        // Reset owned subnets after change owned network
        const { network_id } = this.state;
        // The change triggered by the forward and backward step of the form will not trigger the refresh without old_network_id
        if (old_network_id && old_network_id !== network_id) {
          this.formRef.current.setFieldsValue({
            vip_address: undefined,
          });
        }
      }
    );
    this.getSubnets(new_network_id);
  };

  async getSubnets(value) {
    await this.networkStore.fetchDetail({ id: value });
    await this.fetchSubnetDetails(value);
  }

  fetchSubnetDetails = async (network_id) => {
    const ret = await this.subnetStore.fetchList({ network_id });
    this.setState({
      subnetDetails: ret || [],
    });
  };

  async getFlavors() {
    await this.flavorStore.fetchList({ enabled: true });
    this.setState({
      flavorList: this.flavorStore.list.data || [],
      loading: false,
    });
  }

  async getProviders() {
    const providerList = await this.providerStore.fetchList();
    const defaultProvider =
      providerList.find((p) => p.value === 'amphora') || providerList[0];

    this.setState(
      (prevState) => ({
        providerList,
        provider: defaultProvider?.value || 'amphora',
        providersLoaded: true,
        loading: !prevState.flavorsLoaded,
      }),
      () => {
        // Update form default value if needed
        if (defaultProvider && this.formRef && this.formRef.current) {
          const current = this.formRef.current.getFieldValue('provider');
          if (!current) {
            this.formRef.current.setFieldsValue({
              provider: defaultProvider.value,
            });
          }
        }
      }
    );
  }

  onProviderChange = (value) => {
    this.setState({ provider: value });
  };

  get formItems() {
    const { network_id, subnetDetails = [], providerList = [] } = this.state;
    return [
      {
        name: 'name',
        label: t('Load Balancer Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'provider',
        label: t('Provider'),
        type: 'select',
        required: true,
        options:
          providerList.length > 0
            ? providerList
            : [
                { label: 'amphora', value: 'amphora' },
                { label: 'ovn', value: 'ovn' },
              ],
        onChange: this.onProviderChange,
      },
      {
        name: 'flavor_id',
        label: t('Flavors'),
        type: 'select-table',
        data: this.state.flavorList || [],
        required: false,
        hidden: this.state.provider === 'ovn',
        filterParams: [
          {
            name: 'id',
            label: t('ID'),
          },
          {
            name: 'name',
            label: t('Name'),
          },
        ],
        columns: [
          {
            title: t('ID'),
            dataIndex: 'id',
          },
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Description'),
            dataIndex: 'description',
          },
          {
            title: t('Enabled'),
            dataIndex: 'enabled',
            valueRender: 'yesNo',
          },
        ],
      },
      {
        name: 'vip_network_id',
        label: t('Owned Network'),
        type: 'network-select-table',
        onChange: this.handleOwnedNetworkChange,
        required: true,
      },
      {
        name: 'vip_address',
        label: t('Owned Subnet'),
        type: 'ip-distributor',
        subnets: subnetDetails,
        formRef: this.formRef,
        maxNumber: 1,
        hidden: !network_id,
        required: true,
      },
      {
        name: 'admin_state_enabled',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the port.'),
      },
    ];
  }
}

export default inject('rootStore')(observer(BaseStep));
