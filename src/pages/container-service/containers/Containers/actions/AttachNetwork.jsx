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
import globalContainersStore from 'src/stores/zun/containers';
import { ModalAction } from 'containers/Action';
import { checkItemAction } from 'resources/zun/container';

export class AttachNetwork extends ModalAction {
  static id = 'AttachNetwork';

  static title = t('Attach Network');

  init() {
    this.store = globalContainersStore;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Attach Network');
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };
    return value;
  }

  static policy = 'container:network_attach';

  aliasPolicy = 'zun:container:network_attach';

  static allowed = (item) => {
    return checkItemAction(item, 'network_attach_detach');
  };

  disabledNetwork = (it) => {
    const { networks } = this.item;
    return networks.some((net) => net.id === it.id);
  };

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'networks',
        label: t('Networks'),
        type: 'network-select-table',
        required: true,
        disabledFunc: this.disabledNetwork,
      },
    ];
  }

  onSubmit = (values) => {
    const { networks } = values;
    const network = networks.selectedRowKeys[0];
    return this.store.attachNetwork(this.item.id, { network });
  };
}

export default inject('rootStore')(observer(AttachNetwork));
