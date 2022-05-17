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
import globalVpnIPsecPolicyStore from 'stores/neutron/vpn-ipsec-policy';
import {
  authAlgorithmOptions,
  encryptionAlgorithmOptions,
  ipsecPolicyEncapsulationModeOptions,
  ipsecPolicyTransformProtocolOptions,
  pfsOptions,
} from 'resources/neutron/vpn';

export class Create extends ModalAction {
  static id = 'create-vpn-ipsec-policy';

  static title = t('Create VPN IPsec Policy');

  get name() {
    return t('create vpn ipsec policy');
  }

  static buttonText = t('Create');

  static policy = 'create_ipsecpolicy';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {
      auth_algorithm: 'sha1',
      encryption_algorithm: 'aes-128',
      pfs: 'group5',
      encapsulation_mode: 'tunnel',
      lifetimeValue: 3600,
      transform_protocol: 'esp',
    };
  }

  onSubmit = (values) => {
    const { lifetimeValue, ...rest } = values;
    const data = {
      lifetime: {
        units: 'seconds',
        value: lifetimeValue,
      },
      ...rest,
    };
    return globalVpnIPsecPolicyStore.create(data);
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      {
        name: 'auth_algorithm',
        label: t('Auth Algorithm'),
        type: 'select',
        options: authAlgorithmOptions,
        required: true,
      },
      {
        name: 'encapsulation_mode',
        label: t('Encapsulation Mode'),
        type: 'select',
        options: ipsecPolicyEncapsulationModeOptions,
        required: true,
      },
      {
        name: 'encryption_algorithm',
        label: t('Encryption Algorithm'),
        type: 'select',
        options: encryptionAlgorithmOptions,
        required: true,
      },
      {
        name: 'pfs',
        label: t('PFS'),
        type: 'select',
        options: pfsOptions,
        required: true,
      },
      {
        name: 'lifetimeValue',
        label: t('Lifetime Value'),
        type: 'input-number',
        min: 0,
        required: true,
      },
      {
        name: 'transform_protocol',
        label: t('Transform Protocol'),
        type: 'select',
        options: ipsecPolicyTransformProtocolOptions,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
