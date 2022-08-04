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
import globalPortStore from 'stores/neutron/port-extension';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Release Fixed IP');
  }

  get buttonText() {
    return t('Release');
  }

  get isDanger() {
    return true;
  }

  get actionName() {
    return t('release fixed ip');
  }

  get passiveAction() {
    return t('be released');
  }

  getItemName = (data) => data.ip_address;

  policy = 'update_port';

  onSubmit = (value, containerProps, isBatch, index, values) => {
    const { port: { id, fixed_ips = [] } = {} } = value;
    let newFixedIps = fixed_ips;
    if (isBatch) {
      if (index === 0) {
        values.forEach((item) => {
          const { subnet_id, ip_address } = item;
          newFixedIps = newFixedIps.filter(
            (it) => it.ip_address !== ip_address || it.subnet_id !== subnet_id
          );
        });
      } else {
        return Promise.resolve();
      }
    } else {
      const { subnet_id, ip_address } = value;
      newFixedIps = fixed_ips.filter(
        (it) => it.ip_address !== ip_address || it.subnet_id !== subnet_id
      );
    }
    return globalPortStore.update(
      { id },
      {
        fixed_ips: newFixedIps,
      }
    );
  };
}
