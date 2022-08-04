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

export default class DetachAction extends ConfirmAction {
  get id() {
    return 'detach';
  }

  get title() {
    return t('Detach Security Group');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Detach');
  }

  get actionName() {
    return t('detach security group');
  }

  policy = 'update_port';

  allowedCheckFunc = () => true;

  onSubmit = (item) => {
    const { port: { id, security_groups = [] } = {} } = item;
    const data = {
      security_groups: security_groups.filter((it) => it !== item.id),
    };
    return globalPortStore.update({ id }, data);
  };
}
