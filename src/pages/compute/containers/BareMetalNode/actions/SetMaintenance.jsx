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

export class SetMaintenance extends ModalAction {
  static id = 'SetMaintenance';

  static title = t('Enter Maintenance Mode');

  get name() {
    return t('Enter Maintenance Mode');
  }

  static policy = 'baremetal:node:set_maintenance';

  // static allowed = item => canChangeStatus(item);
  static allowed = (item) => Promise.resolve(!item.maintenance);

  get defaultValue() {
    const { name, uuid } = this.item;
    return {
      name: name || uuid,
    };
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
        name: 'reason',
        label: t('Reason'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const { reason } = values;
    const { uuid } = this.item;
    const body = {
      reason,
    };
    return globalIronicStore.setMaintenance(uuid, body);
  };
}

export default inject('rootStore')(observer(SetMaintenance));
