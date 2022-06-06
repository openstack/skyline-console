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
import { isArray } from 'lodash';
import { isNotLockedOrAdmin, checkStatus } from 'resources/nova/instance';
import globalServerStore from 'stores/nova/instance';

export default class RebootAction extends ConfirmAction {
  get id() {
    return 'reboot';
  }

  get title() {
    return t('Reboot Instance');
  }

  get buttonText() {
    return t('Reboot');
  }

  get actionName() {
    return t('reboot instance');
  }

  get isDanger() {
    return true;
  }

  get passiveAction() {
    return t('be rebooted');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'os_compute_api:servers:reboot';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return isNotLockedOrAdmin(item, this.isAdminPage) && this.canReboot(item);
  };

  performErrorMsg = (failedItems) => {
    const items = isArray(failedItems) ? failedItems : [failedItems];
    const statusErrorItems = items.filter((it) => !this.canReboot(it));
    const lockedItems = items.filter(
      (it) => !isNotLockedOrAdmin(it, this.isAdminPage)
    );
    const msgs = [];
    if (statusErrorItems.length) {
      msgs.push(
        t(
          'Instance "{ name }" status is not in active or shutoff, can not reboot it.',
          { name: this.getName(statusErrorItems) }
        )
      );
    }
    if (lockedItems.length) {
      msgs.push(
        t('Instance "{ name }" is locked, can not reboot it.', {
          name: this.getName(lockedItems),
        })
      );
    }
    return msgs.map((it) => <p>{it}</p>);
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalServerStore.reboot({ id });
  };

  canReboot(instance) {
    const ableStatus = ['active', 'shutoff'];
    return checkStatus(ableStatus, instance);
  }
}
