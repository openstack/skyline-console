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
import { inject, observer } from 'mobx-react';
import globalFlavorStore from 'stores/nova/flavor';
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import {
  isNotLockedOrAdmin,
  checkStatus,
  isIronicInstance,
} from 'resources/instance';
import FlavorSelectTable from '../components/FlavorSelectTable';

@inject('rootStore')
@observer
export default class Resize extends ModalAction {
  static id = 'resize';

  static title = t('Resize');

  init() {
    this.store = globalFlavorStore;
  }

  get name() {
    return t('resize');
  }

  static get modalSize() {
    return 'large';
  }

  get isAsyncAction() {
    return true;
  }

  getModalSize() {
    return 'large';
  }

  get tips() {
    return (
      <div style={{ display: 'inline-table' }}>
        <p style={{ color: '#0068FF' }}>
          {t('The current operation requires the instance to be shut down:')}
        </p>
        <p>
          {t(
            'In order to avoid data loss, the instance will shut down and interrupt your business. Please confirm carefully.'
          )}
        </p>
        <p>
          {t(
            'Forced shutdown may result in data loss or file system damage. You can also take the initiative to shut down and perform operations.'
          )}
        </p>
      </div>
    );
  }

  get defaultValue() {
    const { name, flavor } = this.item;
    const value = {
      instance: name,
      flavor,
    };
    return value;
  }

  static policy = 'os_compute_api:servers:resize';

  static isAtiveOrShutOff = (item) => checkStatus(['active', 'shutoff'], item);

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      !this.isAdminPage &&
        this.isAtiveOrShutOff(item) &&
        isNotLockedOrAdmin(item, isAdminPage) &&
        !isIronicInstance(item)
    );
  };

  get formItems() {
    const { flavor } = this.item;
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'flavor',
        label: t('Current Flavor'),
        type: 'label',
        iconType: 'flavor',
      },
      {
        name: 'newFlavor',
        label: t('Flavor'),
        component: (
          <FlavorSelectTable flavor={flavor} onChange={this.onFlavorChange} />
        ),
        required: true,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      },
      {
        name: 'option',
        label: t('Forced Shutdown'),
        type: 'check',
        content: t('Agree to force shutdown'),
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { newFlavor } = values;
    const flavor = newFlavor.selectedRowKeys[0];
    return globalServerStore.resize({ id, flavor });
  };
}
