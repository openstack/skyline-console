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
  hasOnlineResizeFlavor,
} from 'resources/nova/instance';
import FlavorSelectTable from '../components/FlavorSelectTable';

export class ResizeOnline extends ModalAction {
  static id = 'resize-online';

  static title = t('Online Resize');

  init() {
    this.store = globalFlavorStore;
  }

  get name() {
    return t('online resize');
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
          {t(
            'The current operation can be performed when the instance is online:'
          )}
        </p>
        <p>
          {t(
            'CPU/memory can only be increased or expanded online, and cannot be decreased or reduced online.'
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

  static isActive = (item) => checkStatus(['active'], item);

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      !this.isAdminPage &&
        this.isActive(item) &&
        isNotLockedOrAdmin(item, isAdminPage) &&
        !isIronicInstance(item) &&
        hasOnlineResizeFlavor(item)
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
        type: 'select-table',
        component: (
          <FlavorSelectTable
            flavor={flavor}
            online
            onChange={this.onFlavorChange}
          />
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
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { newFlavor } = values;
    const flavor = newFlavor.selectedRowKeys[0];
    return globalServerStore.liveResize({ id, flavor });
  };
}

export default inject('rootStore')(observer(ResizeOnline));
