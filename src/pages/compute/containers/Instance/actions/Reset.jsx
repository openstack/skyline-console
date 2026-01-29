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
import globalServerStore from 'stores/nova/instance';
import { getOptions } from 'utils/index';

const resetStateOptions = {
  active: t('Active'),
  error: t('Error'),
};

const WARNING_MESSAGE = t(
  'Resetting the server state can make it much harder to recover a server from an error state. If the server is in error status due to a failed move operation then this is likely not the correct approach to fix the problem. Do you wish to continue?'
);

export class Reset extends ModalAction {
  static id = 'reset-state';

  static title = t('Reset');

  static isDanger = true;

  get name() {
    return t('Reset');
  }

  get currentState() {
    const { vm_state, status } = this.item;
    return (vm_state || status || '').toLowerCase();
  }

  get defaultValue() {
    const { id } = this.item;
    const currentStateLabel =
      resetStateOptions[this.currentState] || this.currentState;
    const availableStates = Object.keys(resetStateOptions).filter(
      (it) => it !== this.currentState
    );
    const defaultState = availableStates[0] || '';
    return {
      id,
      currentState: currentStateLabel,
      state: defaultState,
    };
  }

  get instanceName() {
    return (this.item || {}).name;
  }

  get tips() {
    return WARNING_MESSAGE;
  }

  static policy = 'os_compute_api:os-admin-actions:reset_state';

  static allowed = (item) => {
    if (!item) {
      return Promise.resolve(true);
    }
    return Promise.resolve(!item.locked);
  };

  get stateOptions() {
    const availableStates = Object.keys(resetStateOptions).filter(
      (it) => it !== this.currentState
    );
    return getOptions(resetStateOptions).filter((it) =>
      availableStates.includes(it.value)
    );
  }

  get formItems() {
    return [
      {
        name: 'id',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'currentState',
        label: t('Current State'),
        type: 'label',
      },
      {
        name: 'state',
        label: t('New State'),
        type: 'select',
        options: this.stateOptions,
        required: true,
      },
    ];
  }

  init() {
    this.store = globalServerStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { state } = values;
    return this.store.reset({ id, state });
  };
}

export default inject('rootStore')(observer(Reset));
