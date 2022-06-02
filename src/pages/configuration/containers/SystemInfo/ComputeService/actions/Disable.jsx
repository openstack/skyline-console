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
import globalComputeHostStore from 'stores/nova/compute-host';
import { ModalAction } from 'containers/Action';

export class DisableAction extends ModalAction {
  static id = 'disable-host';

  static title = t('Disable Compute Service');

  static buttonText = t('Disable');

  static isDanger = true;

  init() {
    this.store = globalComputeHostStore;
  }

  get name() {
    return t('disable compute service');
  }

  get instanceName() {
    return this.item.binary || this.values.binary;
  }

  get defaultValue() {
    const { host, binary } = this.item;
    const value = {
      host,
      binary,
    };
    return value;
  }

  static allowed = (item) =>
    Promise.resolve(
      item.status === 'enabled' && item.binary === 'nova-compute'
    );

  static policy = 'os_compute_api:os-services:update';

  get formItems() {
    return [
      {
        name: 'binary',
        label: t('Compute Service'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'host',
        label: t('Current Host'),
        type: 'label',
        iconType: 'host',
      },
      {
        name: 'disabled_reason',
        label: t('Reason'),
        type: 'textarea',
        maxLength: 64,
      },
    ];
  }

  onSubmit = (values) => {
    const { binary, id } = this.item;
    const body = {
      ...values,
      binary,
      id,
    };
    return globalComputeHostStore.disable(body);
  };
}

export default inject('rootStore')(observer(DisableAction));
