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
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { ModalAction } from 'containers/Action';

export class DisassociateFip extends ModalAction {
  static id = 'DisassociateFip';

  static title = t('Disassociate Floating Ip');

  init() {
    this.store = new FloatingIpStore();
  }

  get name() {
    return t('disassociate floating ip');
  }

  get fips() {
    const { floating_addresses: addresses = [] } = this.item;

    return addresses.map((it) => ({
      value: it,
      label: it,
    }));
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };

    if (this.fips && this.fips.length > 0) {
      value.address = this.fips[0].value;
    }

    return value;
  }

  static policy = 'update_floatingip';

  static hasFip = (item) => item.floating_addresses.length > 0;

  static allowed = (item) => Promise.resolve(this.hasFip(item));

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'address',
        label: t('Floating Ip'),
        type: 'select',
        required: true,
        options: this.fips,
      },
    ];
  }

  onSubmit = async (values) => {
    const { address } = values;
    const results = await this.store.fetchList({
      floating_ip_address: address,
    });
    if (!results.length) {
      return Promise.resolve();
    }
    return this.store.disassociateFip({ id: results[0].id });
  };
}

export default inject('rootStore')(observer(DisassociateFip));
