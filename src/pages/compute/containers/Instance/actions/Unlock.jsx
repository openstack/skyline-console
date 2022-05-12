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
import { isArray } from 'lodash';
import { isLocked } from 'resources/nova/instance';
import globalServerStore from 'stores/nova/instance';

export default class UnlockAction extends ConfirmAction {
  get id() {
    return 'unlock';
  }

  get title() {
    return t('Unlock Instance');
  }

  get buttonText() {
    return t('Unlock');
  }

  get actionName() {
    return t('unlock instance');
  }

  policy = 'os_compute_api:os-lock-server:unlock';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return !this.isAdminPage && isLocked(item);
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to { action } "{ name }".', {
      action: this.actionName,
      name: instance.name,
    });
    if (!isLocked(instance)) {
      errorMsg = t('Instance "{ name }" is not locked, can not unlock it.', {
        name: instance.name,
      });
    }
    return errorMsg;
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalServerStore.unlock({ id });
  };
}
