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
import globalServerStore from 'stores/nova/instance';
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { ModalAction } from 'containers/Action';
import { isNotError } from 'resources/instance';
import { getCanReachSubnetIdsWithRouterIdInComponent } from 'resources/router';
import {
  getInterfaceWithReason,
  handleFixedIPChange,
} from 'resources/floatingip';
import { getPortsAndReasons } from 'resources/port';

@inject('rootStore')
@observer
export default class AssociateFip extends ModalAction {
  static id = 'AssociateFip';

  static title = t('Associate Floating IP');

  init() {
    this.getInterfaces();
    getCanReachSubnetIdsWithRouterIdInComponent.call(this);
    this.state = {
      fixed_ip: null,
      interfaces: [],
      canAssociateFloatingIPs: [],
      canReachSubnetIdsWithRouterId: [],
      routerIdWithExternalNetworkInfo: [],
      portLoading: true,
    };
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Associate Floating IP');
  }

  async getInterfaces() {
    const { id } = this.item;
    // 获取云主机所有的interface
    const instanceInterfaces = await globalServerStore.fetchInterfaceList({
      id,
    });
    const interfaces = await getInterfaceWithReason(instanceInterfaces);
    this.setState({
      interfaces,
      portLoading: false,
    });
  }

  get ports() {
    const { interfaces, canReachSubnetIdsWithRouterId } = this.state;
    return getPortsAndReasons.call(
      this,
      interfaces,
      canReachSubnetIdsWithRouterId
    );
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
      snapshot: '',
      ipType: 0,
    };
    return value;
  }

  static policy = 'update_floatingip';

  handleFixedIPChange = (e) => handleFixedIPChange.call(this, e);

  static canAssociated = (item) =>
    item.fixed_addresses.length > item.floating_addresses.length;

  static allowed = (item, containerProps) => {
    const { isAdminPage = false } = containerProps;
    return Promise.resolve(
      !isAdminPage && isNotError(item) && this.canAssociated(item)
    );
  };

  get nameForStateUpdate() {
    return ['network', 'ipType'];
  }

  get formItems() {
    const { canAssociateFloatingIPs, portLoading, fipLoading } = this.state;
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'fixed_ip',
        label: t('Instance IP'),
        type: 'select-table',
        required: true,
        datas: this.ports,
        isLoading: portLoading,
        isMulti: false,
        filterParams: [
          {
            label: t('Ip Address'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Ip Address'),
            dataIndex: 'name',
          },
          {
            title: t('Mac Address'),
            dataIndex: 'mac_address',
          },
          {
            title: t('Network'),
            dataIndex: 'network_name',
          },
          {
            title: t('Reason'),
            dataIndex: 'reason',
          },
        ],
        disabledFunc: (record) => !record.available,
        onChange: this.handleFixedIPChange,
      },
      {
        name: 'fip',
        label: t('Floating Ip Address'),
        type: 'select-table',
        required: true,
        datas: canAssociateFloatingIPs,
        isLoading: fipLoading,
        isMulti: false,
        filterParams: [
          {
            label: t('Floating Ip Address'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Floating Ip Address'),
            dataIndex: 'name',
          },
          {
            title: t('Network'),
            dataIndex: 'network_name',
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
    const { fixed_ip, fip } = values;
    const selectedPort = fixed_ip.selectedRows[0];
    const fipId = fip.selectedRowKeys[0];
    return globalFloatingIpsStore.associateFip({
      id: fipId,
      port_id: selectedPort.port_id,
      fixed_ip_address: selectedPort.fixed_ip_address,
    });
  };
}
