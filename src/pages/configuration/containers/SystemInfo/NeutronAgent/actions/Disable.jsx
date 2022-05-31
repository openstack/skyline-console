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
import globalNeutronAgentStore from 'stores/neutron/agent';

export default class Disable extends ConfirmAction {
  get id() {
    return 'disable';
  }

  get title() {
    return t('Disable Neutron Agent');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Disable');
  }

  get actionName() {
    return t('disable neutron agent');
  }

  getItemName = (data) => data.binary;

  policy = 'update_agent';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.canDisable(item);
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    const body = {
      admin_state_up: false,
    };
    return globalNeutronAgentStore.edit({ id }, body);
  };

  canDisable(item) {
    return item.admin_state_up === true;
  }
}
