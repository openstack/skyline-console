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
import {
  isNotLocked,
  checkStatus,
  isIronicInstance,
} from 'resources/nova/instance';
import globalServerStore from 'stores/nova/instance';

export default class PauseAction extends ConfirmAction {
  get id() {
    return 'pause';
  }

  get title() {
    return t('Pause Instance');
  }

  get buttonText() {
    return t('Pause');
  }

  get actionName() {
    return t('pause instance');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'os_compute_api:os-pause-server:pause';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return (
      isNotLocked(item) &&
      this.isActive(item) &&
      !this.isAdminPage &&
      !isIronicInstance(item)
    );
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to { action } "{ name }".', {
      action: this.actionName,
      name: instance.name,
    });
    if (!this.isActive(instance)) {
      errorMsg = t(
        'Instance "{ name }" status is not in active, can not pause it.',
        { name: instance.name }
      );
    } else if (!isNotLocked(instance)) {
      errorMsg = t('Instance "{ name }" is locked, can not pause it.', {
        name: instance.name,
      });
    }
    return errorMsg;
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalServerStore.pause({ id });
  };

  isActive(instance) {
    const ableStatus = ['active'];
    return checkStatus(ableStatus, instance);
  }
}
