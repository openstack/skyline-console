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
import { ModalAction } from 'containers/Action';
import {
  isShutOff,
  isNotDeleting,
  isNotLocked,
  isIronicInstance,
} from 'resources/instance';
import { multiTip } from 'resources/volume';
import { get as _get } from 'lodash';

@inject('rootStore')
@observer
export default class AttachIsoVolume extends ModalAction {
  static id = 'attach-iso-volume';

  static title = t('Attach Iso Volume');

  init() {
    this.store = globalServerStore;
  }

  get name() {
    return t('Attach Iso Volume');
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

  // get tips() {
  //   return <div style={{ display: 'inline-table' }}>
  //     <p style={{ color: '#0068FF' }}>{t('The current operation requires the instance to be shut down:')}</p>
  //     <p>{t('In order to avoid data loss, the instance will shut down and interrupt your business. Please confirm carefully.')}</p>
  //     <p>{t('Forced shutdown may result in data loss or file system damage. You can also take the initiative to shut down and perform operations.')}</p>
  //   </div>;
  // }

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
      !isAdminPage &&
        isNotDeleting(item) &&
        isNotLocked(item) &&
        !isIronicInstance(item) &&
        isShutOff(item)
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
          return diskFormat !== 'iso';
        },
      },
      // {
      //   name: 'option',
      //   label: t('Forced Shutdown'),
      //   type: 'check',
      //   content: t('Agree to force shutdown'),
      //   required: true,
      // },
    ];
  }

  onSubmit = (values) => {
    const { volume } = values;
    const { id } = this.item;
    const volumeId = volume.selectedRowKeys[0];
    const body = {
      volumeAttachment: {
        volumeId,
        disk_bus: 'ide',
        device_type: 'cdrom',
      },
    };
    return this.store.attachVolume({ id, body });
  };
}
