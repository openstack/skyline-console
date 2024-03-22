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

  get imageInfo() {
    const { context = {} } = this.props;
    const { image = {} } = context || {};
    const { selectedRows = [] } = image;
    return selectedRows.length && selectedRows[0];
  }

  get loginUserName() {
    return this.imageInfo?.os_admin_user;
  }

  get loginUserNameInContext() {
    const { username = '' } = this.props.context || {};
    return username || '';
  }

  get defaultValue() {
    const { context = {} } = this.props;
    const data = {
      loginType: context.loginType || this.loginTypes[0],
      more: false,
      username: this.loginUserName || this.loginUserNameInContext,
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

  get isPassword() {
    const { loginType } = this.state;
    return loginType === this.loginTypes[1].value;
  }

  get usernameFormItem() {
    const item = {
      name: 'username',
      label: t('Login Name'),
      type: 'input',
      extra: this.loginUserName
        ? ''
        : t(
            "The feasible configuration of cloud-init or cloudbase-init service in the image is not synced to image's properties, so the Login Name is unknown."
          ),
      tip: t(
        'Whether the Login Name can be used is up to the feasible configuration of cloud-init or cloudbase-init service in the image.'
      ),
      required: this.isPassword,
      hidden: !this.isPassword,
    };
    item.disabled = !!this.loginUserName;
    return item;
  }

  get formItems() {
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
      this.usernameFormItem,
      {
        name: 'keypair',
        label: t('Keypair'),
        type: 'select-table',
        data: this.keypairs,
        isLoading: this.keyPairStore.list.isLoading,
        isMulti: false,
        required: !this.isPassword,
        hidden: this.isPassword,
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
        required: this.isPassword,
        hidden: !this.isPassword,
        otherRule: getPasswordOtherRule('password', 'instance'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: this.isPassword,
        hidden: !this.isPassword,
        otherRule: getPasswordOtherRule('confirmPassword', 'instance'),
      },
    ];
  }
}

export default inject('rootStore')(observer(SystemStep));
