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
import { IronicStore } from 'stores/ironic/ironic';
import { ModalAction } from 'containers/Action';
import { yesNoOptions } from 'utils/constants';

export class SetBootDevice extends ModalAction {
  static id = 'SetBootDevice';

  static title = t('Set Boot Device');

  init() {
    this.store = new IronicStore();
    this.getSupportedBootDevice();
    this.getBootDevice();
  }

  get name() {
    return t('Set Boot Device');
  }

  static policy = [
    'baremetal:node:get_boot_device',
    'baremetal:node:set_boot_device',
  ];

  // static allowed = item => canChangeStatus(item);
  static allowed = () => Promise.resolve(true);

  async getSupportedBootDevice() {
    await this.store.getSupportedBootDevice(this.item.uuid);
    this.updateDefaultValue();
  }

  async getBootDevice() {
    await this.store.getBootDevice(this.item.uuid);
    this.updateDefaultValue();
  }

  get defaultValue() {
    const { name, uuid } = this.item;
    const { boot_device, persistent = false } = this.store.bootDevice || {};
    return {
      name: name || uuid,
      boot_device,
      persistent,
    };
  }

  get deviceOptions() {
    const { supportedBootDevices = [] } = this.store;
    return supportedBootDevices.map((it) => ({
      value: it,
      label: it,
    }));
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Node'),
        type: 'label',
        iconType: 'host',
      },
      {
        name: 'boot_device',
        label: t('Boot Device'),
        type: 'select',
        required: true,
        options: this.deviceOptions,
      },
      {
        name: 'persistent',
        label: t('Persistent'),
        type: 'radio',
        tip: t(
          'Whether the boot device should be set only for the next reboot, or persistently.'
        ),
        options: yesNoOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { boot_device, persistent } = values;
    const { uuid } = this.item;
    const body = {
      boot_device,
      persistent,
    };
    return this.store.setBootDevice(uuid, body);
  };
}

export default inject('rootStore')(observer(SetBootDevice));
