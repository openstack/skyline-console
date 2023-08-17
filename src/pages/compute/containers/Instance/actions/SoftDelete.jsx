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
import { isNotLockedOrAdmin, isIronicInstance } from 'resources/nova/instance';
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

  get isDanger() {
    return true;
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
    'os_compute_api:os-deferred-delete:force',
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

  isShelved = (item) => item.status === 'shelved_offloaded';

  hasShelvedItem = (data) => {
    const items = isArray(data) ? data : [data];
    const item = items.find(this.isShelved);
    return !!item;
  };

  allShelvedItem = (data) => {
    const items = isArray(data) ? data : [data];
    return items.every(this.isShelved);
  };

  initChangeType = (data) => {
    if (this.allShelvedItem(data)) {
      this.onChangeType(true, data);
      this.initCheckedValue = true;
      return;
    }
    this.initCheckedValue = false;
    this.onChangeType(false, data);
  };

  renderExtra(data) {
    if (this.hasShelvedItem(data)) {
      return (
        <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
          {t('The shelved offloaded instance only supports immediate deletion')}
        </div>
      );
    }
    return null;
  }

  renderCheckbox(data) {
    const checkbox = this.initCheckedValue ? (
      <Checkbox checked={this.initCheckedValue} disabled>
        {t('Immediately delete')}
      </Checkbox>
    ) : (
      <Checkbox
        onChange={(e) => {
          this.onChangeType(e.target.checked, data);
        }}
      >
        {t('Immediately delete')}
      </Checkbox>
    );
    return checkbox;
  }

  get deleteTip() {
    return t(
      'When the computing service starts the recycling instance interval, the instance will be stored in the recycling bin after deletion, and will be retained according to the corresponding time interval. You can choose to restore it within this period. After successful recovery, the status of the instance is running and related resources remain unchanged.'
    );
  }

  get backupTip() {
    return t(
      'If you still want to keep the disk data, it is recommended that you create a backup for the disk before deleting.'
    );
  }

  renderCheckboxTip() {
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
        </p>
        <p className={styles['tip-content']}>{this.backupTip}</p>
      </div>
    );
    return (
      <Tooltip title={tip} color="white">
        <QuestionCircleOutlined />
      </Tooltip>
    );
  }

  confirmContext = (data) => {
    const name = this.getName(data);
    this.initChangeType(data);
    return (
      <div>
        <p className={styles.mb16}>
          {this.unescape(
            t('Are you sure to delete instance { name }? ', { name })
          )}
        </p>
        <p className={styles.mb16}>{this.deleteTip}</p>
        <div>
          {this.renderCheckbox(data)}
          {this.renderCheckboxTip()}
        </div>
        {this.renderExtra(data)}
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
    const items = isArray(failedItems) ? failedItems : [failedItems];
    const name = this.getName(items);
    let errorMsg = t('Instance "{ name }" is locked, can not delete it.', {
      name,
    });
    if (items.length > 1) {
      errorMsg = t('Instances "{ name }" are locked, can not delete them.', {
        name,
      });
    }
    return errorMsg;
  };

  onSubmit = (item) => {
    const { id, isHardDeleted = false } = item || this.item;
    const isShelved = this.isShelved(item || this.item);
    if (isHardDeleted || isShelved) {
      return globalServerStore.forceDelete({ id });
    }
    return globalServerStore.delete({ id });
  };
}
