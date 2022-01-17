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
import globalRouterStore from 'stores/neutron/router';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { NetworkStore } from 'stores/neutron/network';
import { ModalAction } from 'containers/Action';
import { toJS } from 'mobx';

@inject('rootStore')
@observer
export default class Create extends ModalAction {
  static id = 'create';

  static title = t('Create SNAT Rule');

  init() {
    this.store = globalRouterStore;
    this.fipStore = new FloatingIpStore();
    this.networkStore = new NetworkStore();
    this.getFloatingIps();
    this.getSubnets();
  }

  get name() {
    return t('Create SNAT rule');
  }

  get routerId() {
    return this.store.detail.id;
  }

  get defaultValue() {
    return {};
  }

  get messageHasItemName() {
    return false;
  }

  static policy = 'update_router';

  static allowed = () => Promise.resolve(true);

  get types() {
    return [
      { label: t('Subnet'), value: 'subnet' },
      { label: t('Instance'), value: 'instance' },
    ];
  }

  getFloatingIps() {
    const params = {
      router_id: this.routerId,
    };
    this.fipStore.fetchList(params);
  }

  getSubnets() {
    this.networkStore.fetchSubnets();
  }

  get fips() {
    const data = toJS(this.fipStore.list.data) || [];
    return data.map((it) => ({
      label: it.ip,
      value: it.ip,
    }));
  }

  get subnets() {
    // todo: filter subnets
    const data = toJS(this.networkStore.subnets) || [];
    return data.map((it) => ({
      label: `${it.name}<${it.cidr}>`,
      value: JSON.stringify({
        deviceId: it.id,
        cidr: it.cidr,
      }),
    }));
  }

  get instances() {
    return [];
  }

  get formItems() {
    const { type } = this.state;
    const isSubnet = type === 'subnet';
    return [
      {
        name: 'snatIpAddress',
        label: t('External IP'),
        type: 'select',
        options: this.fips,
        placeholder: t('Please select external ip'),
        required: true,
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'radio',
        options: this.types,
        required: true,
      },
      {
        name: 'subnet',
        label: t('SNAT Source'),
        type: 'select',
        options: this.subnets,
        placeholder: t('Please select subnet'),
        required: isSubnet,
        hidden: !isSubnet,
      },
      {
        name: 'vm',
        label: t('SNAT Source'),
        type: 'select',
        options: this.instances,
        placeholder: t('Please select instance'),
        required: !isSubnet,
        hidden: isSubnet,
      },
    ];
  }
}
