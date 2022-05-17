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
import globalIronicStore from 'stores/ironic/ironic';
import { ModalAction } from 'containers/Action';
import { provisioningState, canChangeStatus } from 'resources/ironic/ironic';
import { getOptions } from 'utils/index';

export class ManageState extends ModalAction {
  static id = 'ManageState';

  static title = t('Manage State');

  get name() {
    return t('Manage State');
  }

  static policy = 'baremetal:node:set_provision_state';

  static allowed = (item) => canChangeStatus(item);

  get defaultValue() {
    const { name, uuid } = this.item;
    return {
      name: name || uuid,
    };
  }

  get stateOptions() {
    const { provision_state: state } = this.item;

    if (state === 'available' || state === 'active' || state === 'enroll') {
      const maps = {
        manageable: provisioningState.manageable,
      };
      return getOptions(maps);
    }
    const maps = {
      available: provisioningState.available,
    };
    return getOptions(maps);
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
        name: 'target',
        label: t('State'),
        type: 'select',
        required: true,
        options: this.stateOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { target } = values;
    const { uuid, provision_state: state } = this.item;
    let realTarget = '';
    if (target === 'available') {
      realTarget = 'provide';
    } else if (target === 'manageable') {
      switch (state) {
        case 'available':
        case 'enroll':
          realTarget = 'manage';
          break;
        default:
          realTarget = 'delete';
      }
    }
    const body = {
      target: realTarget,
    };
    return globalIronicStore.changeProvision(uuid, body);
  };
}

export default inject('rootStore')(observer(ManageState));
