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
import {
  isNotLockedOrAdmin,
  checkStatus,
  isIronicInstance,
} from 'resources/nova/instance';
import globalServerStore from 'stores/nova/instance';

export default class SoftRebootAction extends ConfirmAction {
  get id() {
    return 'softReboot';
  }

  get title() {
    return t('Soft Reboot Instance');
  }

  get buttonText() {
    return t('Soft Reboot');
  }

  get actionName() {
    return t('soft reboot instance');
  }

  get passiveAction() {
    return t('be soft rebooted');
  }

  policy = 'os_compute_api:servers:reboot';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return (
      isNotLockedOrAdmin(item, this.isAdminPage) &&
      this.isActive(item) &&
      !isIronicInstance(item)
    );
  };

  performErrorMsg = (failedItems) => {
    const items = isArray(failedItems) ? failedItems : [failedItems];
    const notActiveItems = items.filter((it) => !this.isActive(it));
    const lockedItems = items.filter(
      (it) => !isNotLockedOrAdmin(it, this.isAdminPage)
    );
    const ironicItems = items.filter((it) => isIronicInstance(it));
    const msgs = [];
    if (notActiveItems.length) {
      msgs.push(
        t('Instance "{ name }" status is not active, can not soft reboot it.', {
          name: this.getName(notActiveItems),
        })
      );
    }
    if (lockedItems.length) {
      msgs.push(
        t('Instance "{ name }" is locked, can not soft reboot it.', {
          name: this.getName(lockedItems),
        })
      );
    }
    if (ironicItems.length) {
      msgs.push(
        t('Instance "{ name }" is ironic, can not soft reboot it.', {
          name: this.getName(ironicItems),
        })
      );
    }
    return msgs.map((it) => <p>{it}</p>);
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalServerStore.softReboot({ id });
  };

  isActive(instance) {
    const ableStatus = ['active'];
    return checkStatus(ableStatus, instance);
  }
}
