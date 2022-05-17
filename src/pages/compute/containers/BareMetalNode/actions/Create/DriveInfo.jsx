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
import { ImageStore } from 'stores/glance/image';

export class NodeInfo extends Base {
  init() {
    this.imageStore = new ImageStore();
    this.getImages();
  }

  async getImages() {
    await this.imageStore.fetchList({ all_projects: true });
    this.updateDefaultValue();
  }

  get kernelImages() {
    const data = this.imageStore.list.data || [];
    return data
      .filter((it) => it.disk_format === 'aki')
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  get ramdiskImages() {
    const data = this.imageStore.list.data || [];
    return data
      .filter((it) => it.disk_format === 'ari')
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  get ipmiBridges() {
    return [{ value: 'no', label: t('No') }];
  }

  get ipmiPrivLevels() {
    return [
      { value: 'ADMINISTRATOR', label: t('ADMINISTRATOR') },
      { value: 'USER', label: t('USER') },
    ];
  }

  get ipmiProtocolVersions() {
    return [
      { value: '1.5', label: '1.5' },
      { value: '2.0', label: '2.0' },
    ];
  }

  allowed = () => Promise.resolve();

  get defaultValue() {
    const {
      driver_info_deploy_kernel,
      driver_info_deploy_ramdisk,
      driver_info_ipmi_address,
      driver_info_ipmi_port,
      driver_info_ipmi_username,
      driver_info_ipmi_bridge = 'no',
      driver_info_ipmi_priv_level = 'ADMINISTRATOR',
      driver_info_ipmi_protocol_version = '2.0',
      driver_info_ipmi_password = '',
    } = this.props.extra || {};
    return {
      driver_info_deploy_kernel,
      driver_info_deploy_ramdisk,
      driver_info_ipmi_address,
      driver_info_ipmi_port,
      driver_info_ipmi_username,
      driver_info_ipmi_password,
      driver_info_ipmi_bridge,
      driver_info_ipmi_priv_level,
      driver_info_ipmi_protocol_version,
    };
  }

  get formItems() {
    const { more } = this.state;
    return [
      {
        name: 'driver_info_deploy_kernel',
        label: t('Kernel Image'),
        type: 'select',
        options: this.kernelImages,
        required: true,
      },
      {
        name: 'driver_info_deploy_ramdisk',
        label: t('Ramdisk Image'),
        type: 'select',
        options: this.ramdiskImages,
        required: true,
      },
      {
        name: 'driver_info_ipmi_address',
        label: t('IPMI Address'),
        type: 'ip-input',
        required: true,
      },
      {
        name: 'driver_info_ipmi_port',
        label: t('IPMI Port'),
        type: 'input-int',
        max: 65535,
      },
      {
        name: 'driver_info_ipmi_username',
        label: t('IPMI Username'),
        type: 'input',
        required: true,
      },
      {
        name: 'driver_info_ipmi_password',
        label: t('IPMI Password'),
        type: 'input',
        required: true,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
      {
        name: 'driver_info_ipmi_bridge',
        label: t('IPMI Bridge'),
        type: 'select',
        options: this.ipmiBridges,
        hidden: !more,
      },
      {
        name: 'driver_info_ipmi_priv_level',
        label: t('IPMI Privilege Level'),
        type: 'select',
        options: this.ipmiPrivLevels,
        hidden: !more,
      },
      {
        name: 'driver_info_ipmi_protocol_version',
        label: t('IPMI Protocol Version'),
        type: 'select',
        options: this.ipmiProtocolVersions,
        hidden: !more,
      },
    ];
  }
}

export default inject('rootStore')(observer(NodeInfo));
