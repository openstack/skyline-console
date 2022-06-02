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
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { Checkbox } from 'antd';
import _, { isArray } from 'lodash';

export default class Release extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Release');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Release');
  }

  get actionName() {
    return t('Release');
  }

  policy = 'delete_floatingip';

  getItemName = (data) => data.floating_ip_address;

  onChangeType(choosed, data) {
    if (isArray(data)) {
      data.forEach((it) => {
        it.forceRelease = choosed;
      });
    } else {
      data.forceRelease = choosed;
    }
  }

  needForceRelease(item) {
    let checkBox = false;
    if (isArray(item)) {
      item.forEach((it) => {
        it.forceRelease = false;
      });
      const associateFips = item.filter(
        (it) =>
          !(
            _.isNull(it.fixed_ip_address) &&
            it.status === 'DOWN' &&
            _.isNull(it.port_details)
          )
      );
      if (associateFips[0]) {
        checkBox = true;
      }
    } else {
      item.forceRelease = false;
      checkBox = !(
        _.isNull(item.fixed_ip_address) &&
        item.status === 'DOWN' &&
        _.isNull(item.port_details)
      );
    }
    this.hasCheckBox = checkBox;
    return checkBox;
  }

  confirmContext = (data) => {
    let checkBox = null;
    if (this.needForceRelease(data)) {
      checkBox = (
        <div>
          <Checkbox
            style={{ marginTop: '14px' }}
            onChange={(e) => {
              this.onChangeType(e.target.checked, data);
            }}
          >
            {t('Force release')}
          </Checkbox>
        </div>
      );
    }
    if (!this.messageHasItemName) {
      return (
        <div>
          <p>
            {' '}
            {t('Are you sure to {action}?', {
              action: this.actionNameDisplay || this.title,
            })}
          </p>
          {checkBox}
        </div>
      );
    }
    const name = this.getName(data);
    return (
      <div>
        <p>
          {' '}
          {this.unescape(
            t('Are you sure to {action} (instance: {name})?', {
              action: this.actionNameDisplay || this.title,
              name,
            })
          )}
        </p>
        {checkBox}
      </div>
    );
  };

  onSubmit = (item) => {
    const { forceRelease, ...other } = item;
    if (this.hasCheckBox && !forceRelease) {
      const msg = t(
        'Floating ip has already been associate, Please check Force release'
      );
      return Promise.reject(msg);
    }
    return globalFloatingIpsStore.delete(other);
  };
}
