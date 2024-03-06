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

import React from 'react';
import { ConfirmAction } from 'containers/Action';
import globalIronicStore from 'stores/ironic/ironic';

export default class Inspect extends ConfirmAction {
  get id() {
    return 'Inspect';
  }

  get title() {
    return t('Auto Inspect');
  }

  get actionName() {
    return t('Auto Inspect');
  }

  policy = 'baremetal:node:set_provision_state';

  getItemId = (data) => data.uuid;

  allowedCheckFunc = (item) =>
    item.provision_state === 'manageable' && item.driver !== 'ipmi';

  confirmContext = (data) => {
    const name = this.getName(data);
    return (
      <div>
        {this.unescape(
          t('Are you sure to {action} (instance: {name})?', {
            action: this.actionNameDisplay || this.title,
            name,
          })
        )}
        <ul>
          <li>
            {t(
              'This service will automatically query the configuration (CPU, memory, etc.) and MAC address of the physical machine, and the ironic-inspector service will automatically register this information in the node information.'
            )}
          </li>
          <li>
            {t(
              'The entire inspection process takes 5 to 10 minutes, so you need to be patient. After the registration is completed, the node configuration status will return to the manageable status.'
            )}
          </li>
        </ul>
      </div>
    );
  };

  onSubmit = () => {
    const { uuid } = this.item;
    const body = {
      target: 'inspect',
    };
    return globalIronicStore.changeProvision(uuid, body);
  };
}
