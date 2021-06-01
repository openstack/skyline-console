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
import { isNotLockedOrAdmin, checkStatus } from 'resources/instance';
import globalServerStore from 'stores/nova/instance';

export default class StartAction extends ConfirmAction {
  get id() {
    return 'start';
  }

  get title() {
    return t('Start Instance');
  }

  get buttonType() {
    return 'default';
  }

  get buttonText() {
    return t('Start');
  }

  get actionName() {
    return t('start instance');
  }

  get passiveAction() {
    return t('be started');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'os_compute_api:servers:start';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.canStart(item) && isNotLockedOrAdmin(item, this.isAdminPage);
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to {action} "{ name }".', {
      action: this.actionName,
      name: instance.name,
    });
    if (!isNotLockedOrAdmin(instance, this.isAdminPage)) {
      errorMsg = t('Instance "{ name }" is locked, can not start it.', {
        name: instance.name,
      });
    } else if (!this.canStart(instance)) {
      errorMsg = t(
        'Instance "{ name }" status is not shutoff, can not start it.',
        { name: instance.name }
      );
    }
    return errorMsg;
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalServerStore.start({ id });
  };

  canStart(instance) {
    const ableStatus = ['shutdown', 'shutoff', 'crashed'];
    return checkStatus(ableStatus, instance);
  }
}
