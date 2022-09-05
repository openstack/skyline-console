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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalShareInstanceStore from 'stores/manila/share-instance';
import { shareStatus } from 'resources/manila/share';
import { getOptions } from 'utils/index';

export class ResetStatus extends ModalAction {
  static id = 'reset';

  static title = t('Reset Status');

  get name() {
    return t('Reset Status');
  }

  get defaultValue() {
    const { id, status } = this.item;
    const value = {
      id,
      oldStatus: shareStatus[status] || status,
    };
    return value;
  }

  get instanceName() {
    return (this.item || {}).id;
  }

  static policy = 'share_instance:reset_status';

  static allowed = () => Promise.resolve(true);

  get statusOptions() {
    const statusList = ['available', 'error'];
    const { status } = this.item;
    const leftStatusList = statusList.filter((it) => it !== status);
    const options = getOptions(shareStatus).filter((it) =>
      leftStatusList.includes(it.value)
    );
    return options;
  }

  get formItems() {
    return [
      {
        name: 'id',
        label: t('Share Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'oldStatus',
        label: t('Current Status'),
        type: 'label',
      },
      {
        name: 'status',
        label: t('New Status'),
        type: 'select',
        options: this.statusOptions,
        required: true,
      },
    ];
  }

  init() {
    this.store = globalShareInstanceStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return this.store.resetStatus(id, values);
  };
}

export default inject('rootStore')(observer(ResetStatus));
