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
import globalServerStore from 'stores/nova/instance';
import globalRootStore from 'stores/root';
import { ModalAction } from 'containers/Action';
import { allowAttachVolumeInstance } from 'resources/nova/instance';
import { multiTip } from 'resources/cinder/volume';
import { get as _get } from 'lodash';

export class AttachVolume extends ModalAction {
  static id = 'attach-volume';

  static title = t('Attach Volume');

  init() {
    this.store = globalServerStore;
  }

  get name() {
    return t('Attach volume');
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

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };
    return value;
  }

  static policy = 'os_compute_api:os-volumes-attachments:create';

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      globalRootStore.checkEndpoint('cinder') &&
        !isAdminPage &&
        allowAttachVolumeInstance(item)
    );
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
        name: 'volume',
        label: t('Volume'),
        type: 'volume-select-table',
        tip: multiTip,
        isMulti: false,
        required: true,
        serverId: this.item.id,
        disabledFunc: (record) => {
          const diskFormat = _get(
            record,
            'origin_data.volume_image_metadata.disk_format'
          );
          return diskFormat === 'iso';
        },
      },
    ];
  }

  onSubmit = (values) => {
    const { volume } = values;
    const { id } = this.item;
    const volumeId = volume.selectedRowKeys[0];
    const body = {
      volumeAttachment: {
        volumeId,
      },
    };
    return this.store.attachVolume({ id, body });
  };
}

export default inject('rootStore')(observer(AttachVolume));
