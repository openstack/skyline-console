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
import globalServerStore, { ServerStore } from 'stores/nova/instance';
import {
  instanceSelectTablePropsBackend,
  allowAttachInterfaceStatus,
} from 'resources/nova/instance';

export class Attach extends ModalAction {
  static id = 'attach_instance';

  static title = t('Attach Instance');

  init() {
    this.store = new ServerStore();
  }

  get name() {
    return t('Attach Instance');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get defaultValue() {
    const { name, id } = this.item;
    const value = {
      virtual_adapter: name,
      virtual_adapter_id: id,
    };
    return value;
  }

  static policy = 'os_compute_api:os-attach-interfaces:create';

  static allowed = (item) => Promise.resolve(item.device_id === '');

  onSubmit = (values) => {
    const { id } = this.props.item;
    const { instance: { selectedRowKeys = [] } = {} } = values;
    return globalServerStore.addInterface({
      id: selectedRowKeys[0],
      body: {
        interfaceAttachment: {
          port_id: id,
        },
      },
    });
  };

  get formItems() {
    return [
      {
        name: 'virtual_adapter',
        label: t('Virtual Adapter'),
        type: 'label',
      },
      {
        name: 'virtual_adapter_id',
        label: t('Virtual Adapter ID'),
        type: 'label',
        hidden: true,
      },
      {
        name: 'instance',
        label: t('Instance'),
        type: 'select-table',
        backendPageStore: this.store,
        extraParams: { noReminder: true },
        disabledFunc: (item) =>
          item.locked || !allowAttachInterfaceStatus.includes(item.vm_state),
        required: true,
        isMulti: false,
        ...instanceSelectTablePropsBackend,
      },
    ];
  }
}

export default inject('rootStore')(observer(Attach));
