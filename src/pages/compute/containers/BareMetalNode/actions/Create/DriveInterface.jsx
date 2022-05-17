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

export class NodeInterface extends Base {
  get bootInterfaces() {
    return [
      { value: 'pxe', label: t('PXE') },
      { value: 'ipxe', label: t('IPXE') },
      { value: 'fake', label: t('FAKE') },
    ];
  }

  get consoleInterfaces() {
    return [{ value: 'no-console', label: t('No Console') }];
  }

  get networkInterfaces() {
    return [
      { value: 'flat', label: t('FLAT') },
      { value: 'noop', label: t('NOOP') },
    ];
  }

  get raidInterfaces() {
    return [
      { value: 'no-raid', label: t('No Raid') },
      { value: 'agent', label: t('Agent') },
    ];
  }

  get storageInterfaces() {
    return [{ value: 'noop', label: t('NOOP') }];
  }

  get venderInterfaces() {
    return [
      { value: 'ipmitool', label: t('IPMITool') },
      // { value: 'no-vender', label: t('No Vender') },
    ];
  }

  get defaultValue() {
    const {
      boot_interface = 'pxe',
      console_interface = 'no-console',
      network_interface = 'noop',
      raid_interface = 'no-raid',
      storage_interface = 'noop',
      vendor_interface = 'ipmitool',
    } = this.props.extra || {};
    return {
      boot_interface,
      console_interface,
      network_interface,
      raid_interface,
      storage_interface,
      vendor_interface,
    };
  }

  allowed = () => Promise.resolve();

  get formItems() {
    return [
      {
        name: 'boot_interface',
        label: t('Boot Interface'),
        type: 'select',
        options: this.bootInterfaces,
      },
      {
        name: 'console_interface',
        label: t('Console Interface'),
        type: 'select',
        options: this.consoleInterfaces,
      },
      {
        name: 'network_interface',
        label: t('Network Interface'),
        type: 'select',
        options: this.networkInterfaces,
        tip: t(
          'Which Network Interface provider to use when plumbing the network connections for this Node'
        ),
      },
      {
        name: 'raid_interface',
        label: t('Raid Interface'),
        type: 'select',
        options: this.raidInterfaces,
        tip: t('Interface used for configuring RAID on this node'),
      },
      {
        name: 'storage_interface',
        label: t('Storage Interface'),
        type: 'select',
        options: this.storageInterfaces,
        tip: t(
          'Interface used for attaching and detaching volumes on this node'
        ),
      },
      {
        name: 'vendor_interface',
        label: t('Vendor Interface'),
        type: 'select',
        options: this.venderInterfaces,
        tip: t('Interface for vendor-specific functionality on this node'),
      },
    ];
  }
}

export default inject('rootStore')(observer(NodeInterface));
