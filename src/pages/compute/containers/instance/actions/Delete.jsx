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
import { isNotLocked } from 'resources/instance';
import globalServerStore from 'stores/nova/instance';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Instance');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete instance');
  }

  policy = 'os_compute_api:servers:create';

  confirmContext = (data) => {
    const name = isArray(data)
      ? data.map((it) => it.name).join(',')
      : data.name;
    return (
      <div>
        {t('Are you sure to delete instance { name }? ', { name })}
        {t(
          'When you delete an instance, the following resources will be released(Non-root disks will be unmounted and retained):'
        )}
        <ul>
          <li>{t('The instance')}</li>
          <li>{t('The root disk of the instance')}</li>
          <li>{t('Root disk snapshot')}</li>
        </ul>
        <div>
          {t(
            'After the instance is deleted, the instance root disk data will be lost. '
          )}
          {t(
            'If you still want to keep the root disk data, it is recommended that you create a backup for the root disk before deleting, or upload the instance snapshot as an image.'
          )}
        </div>
      </div>
    );
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return isNotLocked(item);
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to delete instance "{ name }".', {
      name: instance.name,
    });
    if (!isNotLocked(instance)) {
      errorMsg = t('Instance "{ name }" is locked, can not delete it.', {
        name: instance.name,
      });
    }
    return errorMsg;
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalServerStore.delete({ id });
  };
}
