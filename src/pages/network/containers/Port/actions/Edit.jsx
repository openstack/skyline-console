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
import globalPortStore from 'stores/neutron/port-extension';

const portTypes =
  'normal,macvtap,direct,baremetal,direct-physical,virtio-forwarder,smart-nic';

const portTypeItems = portTypes.split(',').map((item) => ({
  label: item,
  value: item,
}));

export class Edit extends ModalAction {
  static id = 'edit-virtual-adapter';

  static title = t('Edit');

  static buttonText = t('Edit');

  static policy = 'update_port';

  get defaultValue() {
    const { item } = this.props;
    return {
      ...item,
      mac_address: {
        type: 'manual',
        mac: item.mac_address,
      },
      'binding:vnic_type': item.binding_vnic_type,
    };
  }

  static allowed = () => Promise.resolve(true);

  onSubmit = (values) => {
    const { item: { id } = {} } = this.props;
    const {
      mac_address: { type, mac },
      more,
      ...rest
    } = values;
    const data = {
      ...rest,
    };
    if (type && type !== 'auto') {
      data.mac_address = mac;
    }
    return globalPortStore.update({ id }, data);
  };

  get formItems() {
    const { more } = this.state;

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'mac_address',
        label: t('Mac Address'),
        wrapperCol: { span: 16 },
        type: 'mac-address',
        required: true,
        // component: <MacAddressInput />,
      },
      {
        name: 'binding:vnic_type',
        label: t('Port Type'),
        type: 'select',
        required: true,
        options: portTypeItems,
        hidden: !more,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
