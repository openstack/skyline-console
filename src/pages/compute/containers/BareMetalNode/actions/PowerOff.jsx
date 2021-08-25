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

import { ConfirmAction } from 'containers/Action';
import globalIronicStore from 'stores/ironic/ironic';

export default class PowerOn extends ConfirmAction {
  get id() {
    return 'power-on';
  }

  get title() {
    return t('Power On');
  }

  get actionName() {
    return t('Power On');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'baremetal:node:set_power_state';

  getItemId = (data) => data.uuid;

  allowedCheckFunc = (item) => item.power_state === 'power off';

  onSubmit = () => {
    const { uuid } = this.item;
    const body = {
      target: 'power on',
    };
    return globalIronicStore.changePower(uuid, body);
  };
}
