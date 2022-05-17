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
import { RouterStore } from 'stores/neutron/router';
import globalVpnServicesStore from 'stores/neutron/vpn-service';
import { getRouterSelectTablePropsBackend } from 'resources/neutron/router';

export class Create extends ModalAction {
  static id = 'create-vpn';

  static title = t('Create VPN');

  get name() {
    return t('create vpn');
  }

  static buttonText = t('Create');

  static policy = 'create_vpnservice';

  static allowed = () => Promise.resolve(true);

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.routerStore = new RouterStore();
  }

  onSubmit = (values) => {
    const { name, description, router_id } = values;
    return globalVpnServicesStore.create({
      name,
      description,
      router_id: router_id.selectedRowKeys[0],
      // project_id: this.currentProjectId,
    });
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      {
        name: 'router_id',
        label: t('Router'),
        type: 'select-table',
        backendPageStore: this.routerStore,
        extraParams: { project_id: this.currentProjectId },
        ...getRouterSelectTablePropsBackend(this),
        disabledFunc: (item) => !item.external_gateway_info,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
