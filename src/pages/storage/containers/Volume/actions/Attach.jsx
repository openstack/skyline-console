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
import { ServerStore } from 'stores/nova/instance';
import globalVolumeStore from 'stores/cinder/volume';
import {
  allowAttachVolumeInstance,
  instanceSelectTablePropsBackend,
} from 'resources/nova/instance';
import { isAvailable, isMultiAttach } from 'resources/cinder/volume';

export class Attach extends ModalAction {
  static id = 'attach';

  static title = t('Attach');

  init() {
    this.store = globalVolumeStore;
    this.vmStore = new ServerStore();
  }

  get name() {
    return t('Attach');
  }

  get isAsyncAction() {
    return true;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  disabledInstance = (ins) =>
    !allowAttachVolumeInstance(ins) || this.alreadyAttached(ins);

  get defaultValue() {
    const { name, id, size, volume_type } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
    };
    return value;
  }

  alreadyAttached = (ins) => {
    const { attachments = [] } = this.item;
    const attach = attachments.find((it) => it.server_id === ins.id);
    return !!attach;
  };

  static policy = 'os_compute_api:os-volumes-attachments:create';

  static allowed = (item) =>
    Promise.resolve(isAvailable(item) || isMultiAttach(item));

  get formItems() {
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'instance',
        label: t('Instance'),
        type: 'select-table',
        required: true,
        backendPageStore: this.vmStore,
        disabledFunc: this.disabledInstance,
        extraParams: { noReminder: true },
        isMulti: false,
        ...instanceSelectTablePropsBackend,
      },
    ];
  }

  onSubmit = ({ instance }) => {
    const { id } = this.item;
    const { selectedRowKeys } = instance;
    return Promise.all(
      selectedRowKeys.map((instanceId) =>
        this.vmStore.attachVolume({
          id: instanceId,
          body: {
            volumeAttachment: {
              volumeId: id,
            },
          },
        })
      )
    );
  };
}

export default inject('rootStore')(observer(Attach));
