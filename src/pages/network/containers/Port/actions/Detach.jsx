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
import globalServerStore from 'stores/nova/instance';

export default class Detach extends ConfirmAction {
  get id() {
    return 'detach_instance';
  }

  get title() {
    return t('Detach Instance');
  }

  get buttonText() {
    return t('Detach');
  }

  get actionName() {
    return t('detach instance');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'os_compute_api:os-attach-interfaces:delete';

  allowedCheckFunc = (item) =>
    !!item.device_id && item.device_owner === 'compute:nova';

  onSubmit = async () => {
    const { id, device_id } = this.item;
    return globalServerStore.detachInterface({ id: device_id, ports: [id] });
  };
}
