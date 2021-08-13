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
import globalKeyPairStore from 'stores/nova/keypair';
import Base from 'components/Form';
import { getPasswordOtherRule } from 'utils/validate';

export class SystemStep extends Base {
  init() {
    this.keyPairStore = globalKeyPairStore;
    this.getKeypairs();
  }

  get title() {
    return 'SystemStep';
  }

  get name() {
    return 'SystemStep';
  }

  get keypairs() {
    return (this.keyPairStore.list.data || []).map((it) => ({
      ...it,
      key: it.name,
      id: it.name,
    }));
  }

  get defaultValue() {
    const { context = {} } = this.props;
    const data = {
      loginType: context.loginType || this.loginTypes[0],
      more: false,
    };
    return data;
  }

  get loginTypes() {
    return [
      {
        label: t('Keypair'),
        value: 'keypair',
      },
      {
        label: t('Password'),
        value: 'password',
      },
    ];
  }

  allowed = () => Promise.resolve();

  getKeypairs() {
    this.keyPairStore.fetchList();
  }

  get nameForStateUpdate() {
    return ['loginType', 'password', 'confirmPassword'];
  }

  get formItems() {
    const { loginType } = this.state;
    const isPassword = loginType === this.loginTypes[1].value;

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        isInstance: true,
        required: true,
      },
      {
        name: 'loginType',
        label: t('Login Type'),
        type: 'radio',
        options: this.loginTypes,
        isWrappedValue: true,
      },
      {
        name: 'keypair',
        label: t('Keypair'),
        type: 'select-table',
        data: this.keypairs,
        isLoading: this.keyPairStore.list.isLoading,
        isMulti: false,
        required: !isPassword,
        hidden: isPassword,
        tip: t(
          'The SSH key is a way to remotely log in to the instance. The cloud platform only helps to keep the public key. Please keep your private key properly.'
        ),
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
            title: t('Fingerprint'),
            dataIndex: 'fingerprint',
          },
        ],
        selectedLabel: t('Keypair'),
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: isPassword,
        hidden: !isPassword,
        otherRule: getPasswordOtherRule('password', 'instance'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: isPassword,
        hidden: !isPassword,
        otherRule: getPasswordOtherRule('confirmPassword', 'instance'),
      },
    ];
  }
}

export default inject('rootStore')(observer(SystemStep));
