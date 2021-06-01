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
import { isNotLockedOrAdmin, isIronicInstance } from 'resources/instance';
import globalServerStore from 'stores/nova/instance';
import { Checkbox, Tooltip } from 'antd';
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import classnames from 'classnames';
import styles from './index.less';

export default class SoftDelete extends ConfirmAction {
  get id() {
    return 'SoftDelete';
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

  get isAsyncAction() {
    return true;
  }

  policy = [
    'os_compute_api:servers:delete',
    'os_compute_api:os-deferred-delete',
  ];

  onChangeType(choosed, data) {
    if (isArray(data)) {
      data.forEach((it) => {
        it.isHardDeleted = choosed;
      });
    } else {
      data.isHardDeleted = choosed;
    }
  }

  confirmContext = (data) => {
    const name = this.getName(data);
    this.onChangeType(false, data);
    const tip = (
      <div className={styles.tip}>
        <h4 className={styles['tip-title']}>
          <ExclamationCircleFilled className={styles['tip-icon']} />
          {t('The instance deleted immediately cannot be restored')}
        </h4>
        <p className={classnames(styles['tip-content'], styles.mb16)}>
          {t(
            'The associated floating IP, virtual adapter, volume and other resources will be automatically disassociated.'
          )}
          {/* {t('The instance root volume and snapshot will be removed.')} */}
        </p>
        <p className={styles['tip-content']}>
          {/* {t('After the instance is deleted, the instance root disk data will be lost. ')} */}
          {t(
            'If you still want to keep the disk data, it is recommended that you create a snapshot for the disk before deleting, or create a snapshot for instance.'
          )}
        </p>
      </div>
    );
    return (
      <div>
        <p className={styles.mb16}>
          {this.unescape(
            t('Are you sure to delete instance { name }? ', { name })
          )}
        </p>
        <p className={styles.mb16}>
          {t(
            'After deletion, the instance will be stored in the recycle bin, which will be reserved for 7 * 24h by default and can be restored within the period. After successful recovery, the status of the instance is running and related resources remain unchanged.'
          )}
        </p>
        <div>
          <Checkbox
            onChange={(e) => {
              this.onChangeType(e.target.checked, data);
            }}
          >
            {t('Immediately delete')}
          </Checkbox>
          <Tooltip title={tip} color="white">
            <QuestionCircleOutlined />
          </Tooltip>
        </div>
      </div>
    );
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return (
      isNotLockedOrAdmin(item, this.isAdminPage) && !isIronicInstance(item)
    );
  };

  performErrorMsg = (failedItems) => {
    const instance = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to delete instance "{ name }".', {
      name: instance.name,
    });
    if (!isNotLockedOrAdmin(instance, this.isAdminPage)) {
      errorMsg = t('Instance "{ name }" is locked, can not delete it.', {
        name: instance.name,
      });
    }
    return errorMsg;
  };

  // eslint-disable-next-line no-unused-vars
  onSubmit = (item) => {
    const { id, isHardDeleted = false, expiredTime } = item || this.item;
    if (isHardDeleted) {
      return globalServerStore.forceDelete({ id }, expiredTime);
    }
    return globalServerStore.delete({ id }, expiredTime);
  };
}
