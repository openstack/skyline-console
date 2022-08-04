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
import globalPortStore from 'stores/neutron/port-extension';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'stores/neutron/subnet';

export class AllocateIP extends ModalAction {
  static id = 'allocate-ip';

  static title = t('Allocate IP');

  get name() {
    return t('Allocate IP');
  }

  static policy = 'update_port:fixed_ips:ip_address';

  init() {
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
    this.getNetworkDetail(this.item.network_id);
    this.getSubnets(this.item.network_id);
  }

  async getSubnets(network_id) {
    const ret = await this.subnetStore.fetchList({ network_id });
    this.setState({
      subnetDetails: ret || [],
    });
  }

  async getNetworkDetail(networkId) {
    const ret = await this.networkStore.fetchDetail({ id: networkId });
    this.updateFormValue('network_name', ret.name);
  }

  get defaultValue() {
    return {
      network_id: this.item.network_id,
    };
  }

  get isAllowed() {
    return true;
  }

  static get modalSize() {
    return 'large';
  }

  get messageHasItemName() {
    return false;
  }

  static allowed = () => Promise.resolve(true);

  onSubmit = (values) => {
    const { fixed_ips } = values;
    const data = fixed_ips.map((i) => {
      const ret = {
        subnet_id: i.subnet,
      };
      if (i.ip_address && i.ip_address.type === 'manual') {
        ret.ip_address = i.ip_address.ip;
      }
      return ret;
    });
    return globalPortStore.update(this.item, {
      fixed_ips: [...data, ...this.item.fixed_ips],
    });
  };

  get formItems() {
    const { subnetDetails = [] } = this.state;

    return [
      {
        name: 'network_id',
        label: t('Owned Network ID'),
        type: 'label',
      },
      {
        name: 'network_name',
        label: t('Owned Network'),
        type: 'label',
      },
      {
        name: 'fixed_ips',
        label: t('Owned Subnet'),
        // component: <IPDistributor subnets={subnetDetails} />,
        type: 'ip-distributor',
        subnets: subnetDetails,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(AllocateIP));
