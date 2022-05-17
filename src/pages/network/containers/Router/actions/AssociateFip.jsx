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
import { toJS } from 'mobx';
import { RouterStore } from 'stores/neutron/router';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { ModalAction } from 'containers/Action';

export class AssociateFip extends ModalAction {
  static id = 'associate-fip';

  static title = t('Associate Floating IP');

  init() {
    this.store = new RouterStore();
    this.floatingIpStore = new FloatingIpStore();
    this.getFipList();
  }

  get name() {
    return t('associate floating ip');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get defaultValue() {
    return {
      name: this.item.name,
      external_network: this.item.external_gateway_info.network_name,
    };
  }

  get fipList() {
    const fips = toJS(this.floatingIpStore.list.data || []).filter(
      (it) => !it.router_id
    );
    const { externalNetworkName } = this.item;
    return fips.map((it) => ({
      ...it,
      name: it.floating_ip_address,
      networkName: externalNetworkName,
    }));
  }

  getFipList() {
    const {
      external_gateway_info: { network_id },
    } = this.item;
    this.floatingIpStore.fetchList({
      floating_network_id: network_id,
      project_id: this.currentProjectId,
      status: 'DOWN',
    });
  }

  static canAssociate(item) {
    if (!item) {
      return true;
    }
    return item.hasExternalGateway && item.externalFixedIps.length < 1;
  }

  static policy = 'update_router';

  static allowed = (item) => Promise.resolve(this.canAssociate(item));

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'router',
      },
      {
        name: 'external_network',
        label: t('External Network'),
        type: 'label',
        iconType: 'externalNetwork',
      },
      {
        name: 'floatingIp',
        label: t('Floating IP'),
        type: 'select-table',
        required: true,
        data: this.fipList,
        isLoading: this.floatingIpStore.list.isLoading,
        isMulti: false,
        filterParams: [
          {
            label: t('IP Address'),
            name: 'name',
          },
          {
            label: t('Network Name'),
            name: 'networkName',
          },
        ],
        columns: [
          {
            title: t('IP Address'),
            dataIndex: 'name',
          },
          {
            title: t('Network Name'),
            dataIndex: 'networkName',
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'sinceTime',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const fip = values.floatingIp.selectedRows[0];
    return this.store.associateFip({ id, fip, router: this.item });
  };
}

export default inject('rootStore')(observer(AssociateFip));
