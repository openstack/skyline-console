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
import globalRouterStore from 'stores/neutron/router';
import { NetworkStore } from 'stores/neutron/network';
import { ModalAction } from 'containers/Action';
import { networkStatus, networkSortProps } from 'resources/neutron/network';

export class SetGateway extends ModalAction {
  static id = 'set-gateway';

  static title = t('Open External Gateway');

  init() {
    this.store = globalRouterStore;
    this.networkStore = new NetworkStore();
  }

  static policy = 'update_router';

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('open external gateway');
  }

  static allowed = (item) => Promise.resolve(!item.external_gateway_info);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'router',
      },
      {
        name: 'externalNetwork',
        label: t('External Gateway'),
        type: 'select-table',
        backendPageStore: this.networkStore,
        extraParams: { 'router:external': true },
        required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            valueMap: networkStatus,
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'sinceTime',
            sorter: false,
          },
        ],
        ...networkSortProps,
      },
    ];
  }

  onSubmit = (values) => {
    const { externalNetwork } = values;
    const { id } = this.item;
    const body = {
      external_gateway_info: {
        network_id: externalNetwork.selectedRowKeys[0],
      },
    };
    return this.store.edit({ id }, body);
  };
}

export default inject('rootStore')(observer(SetGateway));
