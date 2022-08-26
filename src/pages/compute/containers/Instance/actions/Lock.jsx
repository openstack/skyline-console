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
import { isNotLocked } from 'resources/nova/instance';
import globalServerStore from 'stores/nova/instance';

export default class LockAction extends ConfirmAction {
  get id() {
    return 'lock';
  }

  get title() {
    return t('Lock Instance');
  }

  get buttonText() {
    return t('Lock');
  }

  get actionName() {
    return t('lock instance');
  }

  policy = 'os_compute_api:os-lock-server:lock';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return !this.isAdminPage && isNotLocked(item);
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to { action } "{ name }".', {
      action: this.actionName,
      name: instance.name,
    });
    if (!isNotLocked(instance)) {
      errorMsg = t('Instance "{ name }" has already been locked.', {
        name: instance.name,
      });
    }
    return errorMsg;
  };

  confirmContext = (data) => {
    if (!this.messageHasItemName) {
      return t('Are you sure to {action}?', {
        action: this.actionNameDisplay || this.title,
      });
    }
    const name = this.getName(data);
    return (
      t('Are you sure to {action} (instance: {name})?', {
        action: this.actionNameDisplay || this.title,
        name,
      }) +
      t(
        'Lock instance will lock the operations that have a direct impact on the operation of the instance, such as: shutdown, restart, delete, the mounting and unmounting of volume, etc. It does not involve the capacity expansion and change type of volume.'
      )
    );
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalServerStore.lock({ id });
  };
}
