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
import globalVpnIKEPolicyStore from 'stores/neutron/vpn-ike-policy';
import {
  authAlgorithmOptions,
  encryptionAlgorithmOptions,
  ikePolicyIKEVersionOptions,
  pfsOptions,
} from 'resources/neutron/vpn';

export class Create extends ModalAction {
  static id = 'create-vpn-ike-policy';

  static title = t('Create VPN IKE Policy');

  get name() {
    return t('create vpn ike policy');
  }

  static buttonText = t('Create');

  static policy = 'create_ikepolicy';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {
      auth_algorithm: 'sha1',
      encryption_algorithm: 'aes-128',
      pfs: 'group5',
      lifetimeValue: 3600,
      ike_version: 'v1',
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
    return globalVpnIKEPolicyStore.create(data);
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
        name: 'ike_version',
        label: t('IKE Version'),
        type: 'select',
        options: ikePolicyIKEVersionOptions,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
