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
import Base from 'components/Form';
import { LbaasStore } from 'stores/octavia/loadbalancer';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';

export class BaseStep extends Base {
  init() {
    this.store = new LbaasStore();
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
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
    return {
      project_id: this.props.rootStore.user.project.id,
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
        // 如果是分步表单的前进后退触发的change，没有old_network_id则不会触发刷新
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

  get formItems() {
    const { network_id, subnetDetails = [] } = this.state;
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
    ];
  }
}

export default inject('rootStore')(observer(BaseStep));
