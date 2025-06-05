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
import globalServerStore from 'stores/nova/instance';
import globalHypervisorStore from 'stores/nova/hypervisor';
import globalServerGroupStore from 'stores/nova/server-group';
import policyType from 'resources/nova/server-group';
import Base from 'components/Form';
import { getPasswordOtherRule, asciiValidator } from 'utils/validate';
import {
  hypervisorColumns,
  hypervisorFilters,
} from 'resources/nova/hypervisor';
import { physicalNodeTypes } from 'resources/nova/instance';
import { getOptions } from 'utils';
import { getKeyPairHeader } from 'resources/nova/keypair';
import { has } from 'lodash';

export class SystemStep extends Base {
  init() {
    this.keyPairStore = globalKeyPairStore;
    this.serverStore = globalServerStore;
    this.hypervisorStore = globalHypervisorStore;
    this.serverGroupStore = globalServerGroupStore;
    this.getKeypairs();
    this.hasAdminRole && this.getHypervisors();
    this.getServerGroups();
  }

  get isStep() {
    return true;
  }

  get hypervisorColumns() {
    const columns = [...hypervisorColumns];
    columns[0] = {
      title: t('Hostname'),
      dataIndex: 'hypervisor_hostname',
    };
    return columns;
  }

  get hypervisorFilters() {
    const columns = [...hypervisorFilters];
    columns[0] = {
      label: t('Hostname'),
      name: 'hypervisor_hostname',
    };
    return columns;
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

  get hypervisors() {
    return (this.hypervisorStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
      name: it.hypervisor_hostname,
    }));
  }

  get serverGroups() {
    return (this.serverGroupStore.list.data || []).filter((it) => {
      const { servergroup } = this.locationParams;
      return servergroup ? it.id === servergroup : true;
    });
  }

  get serverGroupRequired() {
    const { more } = this.state;
    const { servergroup } = this.locationParams;
    return !!servergroup && more;
  }

  get inputHelp() {
    const { input = '' } = this.state;
    const maxCount = 1000;
    return t(
      'Entered: {length, plural, =1 {one character} other {# characters} }(maximum {maxCount} characters)',
      { length: input.length, maxCount }
    );
  }

  get sourceInfo() {
    const { context = {} } = this.props;
    const {
      source = {},
      image = {},
      bootableVolume = {},
      instanceSnapshot = {},
    } = context;
    if (source.value === 'image') {
      const { selectedRows = [] } = image;
      return selectedRows.length && selectedRows[0];
    }
    if (source.value === 'bootableVolume') {
      const { selectedRows = [] } = bootableVolume;
      // create instance from instance list
      const originData =
        (selectedRows.length && selectedRows[0].origin_data) || {};
      // create instance from volume list
      const volumeImageMetadata =
        selectedRows.length && selectedRows[0].volume_image_metadata;
      return originData.volume_image_metadata || volumeImageMetadata;
    }
    if (source.value === 'instanceSnapshot') {
      const { selectedRows = [] } = instanceSnapshot;
      return selectedRows.length && selectedRows[0];
    }
    return false;
  }

  get isWindowsImage() {
    return this.sourceInfo && this.sourceInfo.os_distro === 'windows';
  }

  get defaultValue() {
    const { servergroup } = this.locationParams;
    const { context = {} } = this.props;
    const data = {
      /**
       * If context.loginType exists, use it;
       * Otherwise, default to "No Change"
       */
      loginType: context.loginType || this.loginTypes[0],
      more: false,
      physicalNodeType: physicalNodeTypes[0],
      userData: '',
      username: this.loginUserName || this.loginUserNameInContext,
    };
    if (servergroup) {
      data.serverGroup = {
        selectedRowKeys: [servergroup],
        selectedRows: this.serverGroups.filter((it) => it.id === servergroup),
      };
    }
    const { name } = this.state;
    if (name) {
      data.name = name;
    }
    return data;
  }

  get loginTypes() {
    return [
      {
        label: t('No Change'),
        value: '',
      },
      {
        label: t('Keypair'),
        value: 'keypair',
        disabled: this.isWindowsImage,
      },
      {
        label: t('Password'),
        value: 'password',
      },
    ];
  }

  allowed = () => Promise.resolve();

  async getKeypairs() {
    await this.keyPairStore.fetchList();
  }

  getHypervisors() {
    this.hypervisorStore.fetchList();
  }

  async getServerGroups() {
    await this.serverGroupStore.fetchList();
    this.updateDefaultValue();
    const { servergroup } = this.locationParams;
    if (servergroup) {
      this.onServerGroupChange({ selectedRows: this.serverGroups });
    }
  }

  get nameForStateUpdate() {
    return [
      'name',
      'loginType',
      'password',
      'confirmPassword',
      'more',
      'physicalNodeType',
      'serverGroup',
    ];
  }

  get loginUserName() {
    return this.sourceInfo && this.sourceInfo.os_admin_user;
  }

  get loginUserNameInContext() {
    const { username = '' } = this.props.context || {};
    return username || '';
  }

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'serverGroup')) {
      this.onServerGroupChange(changedFields.serverGroup);
    }
  };

  onServerGroupChange = (value) => {
    const { selectedRows = [] } = value || {};
    this.updateContext({
      serverGroupRow: selectedRows[0] || null,
    });
  };

  get isNoChange() {
    const { loginType } = this.state;
    return !loginType;
  }

  get isKeyPair() {
    const { loginType } = this.state;
    return loginType === 'keypair';
  }

  get isPassword() {
    const { loginType } = this.state;
    return loginType === 'password';
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
    const { more = false, physicalNodeType } = this.state;
    const isManually = physicalNodeType === physicalNodeTypes[1].value;

    const { initKeyPair } = this.state;

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        isInstance: true,
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
        required: !this.isKeyPair,
        hidden: !this.isKeyPair,
        header: getKeyPairHeader(this),
        initValue: initKeyPair,
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
        label: t('Login Password'),
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
      {
        type: 'divider',
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
      {
        name: 'physicalNodeType',
        label: t('Physical Node'),
        type: 'radio',
        hidden: !more || !this.hasAdminRole,
        options: physicalNodeTypes,
        isWrappedValue: true,
      },
      {
        name: 'physicalNode',
        label: t('Specify Physical Node'),
        type: 'select-table',
        hidden: !this.hasAdminRole || !more || !isManually,
        required: isManually,
        data: this.hypervisors,
        isLoading: this.hypervisorStore.list.isLoading,
        extra: t(
          'You can manually specify a physical node to create an instance.'
        ),
        columns: this.hypervisorColumns,
        filterParams: this.hypervisorFilters,
      },
      {
        name: 'serverGroup',
        label: t('Server Group'),
        type: 'select-table',
        hidden: !more,
        data: this.serverGroups,
        isLoading: this.serverGroupStore.list.isLoading,
        required: this.serverGroupRequired,
        // onChange: this.onServerGroupChange,
        extra: t(
          'Using server groups, you can create cloud hosts on the same/different physical nodes as much as possible to meet the affinity/non-affinity requirements of business applications.'
        ),
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Member Count'),
            dataIndex: 'members',
            render: (value) => value.length,
          },
          {
            title: t('Policy'),
            dataIndex: 'policy',
            valueMap: policyType,
          },
        ],
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
          {
            label: t('Policy'),
            name: 'policy',
            options: getOptions(policyType),
          },
        ],
      },
      {
        name: 'userData',
        label: t('User Data'),
        type: 'textarea-from-file',
        validator: asciiValidator,
        hidden: !more,
        extra: t(
          'The user needs to ensure that the input is a shell script that can run completely and normally.'
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(SystemStep));
