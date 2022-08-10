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
import { isNotError } from 'resources/nova/instance';
import { getCanReachSubnetIdsWithRouterIdInComponent } from 'resources/neutron/router';
import {
  getInterfaceWithReason,
  handleFixedIPChange,
  getFixedIPFormItemForAssociate,
  getFIPFormItemForAssociate,
  getFIPFormItemExtra,
  disableFIPAssociate,
} from 'resources/neutron/floatingip';
import { getPortsAndReasons } from 'resources/neutron/port';

export class AssociateFip extends ModalAction {
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
    // get all the interfaces of the instance
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

  getFIPFormItemExtra() {
    return getFIPFormItemExtra();
  }

  disableFIPAssociate(record) {
    return disableFIPAssociate(record);
  }

  get formItems() {
    const fixedIpFormItem = getFixedIPFormItemForAssociate(
      t('Instance IP'),
      this
    );
    const fipFormItem = getFIPFormItemForAssociate(this);
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      fixedIpFormItem,
      fipFormItem,
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

export default inject('rootStore')(observer(AssociateFip));
