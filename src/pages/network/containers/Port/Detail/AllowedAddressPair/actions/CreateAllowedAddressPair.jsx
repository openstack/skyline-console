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
import { ipValidate } from 'utils/validate';
import { isEmpty } from 'lodash';

const { isIPv4, isIpv6, isIpCidr, isIPv6Cidr } = ipValidate;

export class CreateAllowedAddressPair extends ModalAction {
  static id = 'create-ip';

  static title = t('Create Allowed Address Pair');

  static policy = 'update_port';

  init() {
    this.store = globalPortStore;
  }

  get name() {
    return t('create allowed address pair');
  }

  get instanceName() {
    return this.values.ip_address;
  }

  get isAllowed() {
    return true;
  }

  static get modalSize() {
    return 'middle';
  }

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {
      ip_version: 'ipv4',
    };
  }

  onSubmit = (values) => {
    const { allowed_address_pairs = [] } = this.item;
    const { ip_address, mac_address } = values;
    const data = {
      ip_address,
    };
    mac_address.type === 'manual' && (data.mac_address = mac_address.mac);
    return globalPortStore
      .update(this.item, {
        allowed_address_pairs: [data, ...allowed_address_pairs],
      })
      .then((ret) => {
        globalPortStore.setDetail(ret.port);
      });
  };

  checkIpOrCidr = (value) => {
    if (isEmpty(value)) return false;

    const { ip_version = 'ipv4' } = this.state;

    if (ip_version === 'ipv4' && !(isIPv4(value) || isIpCidr(value)))
      return false;

    if (ip_version === 'ipv6' && !(isIpv6(value) || isIPv6Cidr(value)))
      return false;

    return true;
  };

  get formItems() {
    // const { ip_version = 'ipv4' } = this.state;
    // const isIpv4 = ip_version === 'ipv4';

    return [
      {
        name: 'ip_version',
        label: t('IP Version'),
        type: 'select',
        options: [
          {
            label: 'ipv4',
            value: 'ipv4',
          },
          {
            label: 'ipv6',
            value: 'ipv6',
          },
        ],
        onChange: (e) => {
          this.setState(
            {
              ip_version: e,
            },
            () => {
              // fix for changed then still error/success
              this.formRef.current.validateFields();
            }
          );
        },
        required: true,
      },
      {
        name: 'ip_address',
        label: t('CIDR or IP'),
        type: 'input',
        required: true,
        validator: (rule, value) => {
          if (!this.checkIpOrCidr(value)) {
            return Promise.reject(new Error(t('Invalid CIDR or IP address.')));
          }
          return Promise.resolve();
        },
      },
      {
        name: 'mac_address',
        label: t('Mac Address'),
        wrapperCol: { span: 16 },
        required: true,
        // component: <MacAddressInput />,
        type: 'mac-address',
        options: [
          {
            label: t('From port'),
            value: 'auto',
          },
          {
            label: t('Manual input'),
            value: 'manual',
          },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(CreateAllowedAddressPair));
