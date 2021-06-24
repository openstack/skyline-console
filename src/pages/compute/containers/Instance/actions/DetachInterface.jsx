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
import { ServerStore } from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { portStatus } from 'resources/port';
import { isActiveOrShutOff, isNotLocked } from 'resources/instance';

@inject('rootStore')
@observer
export default class DetachInterface extends ModalAction {
  static id = 'detach-interface';

  static title = t('Detach Interface');

  init() {
    this.store = new ServerStore();
    this.getPorts();
  }

  get name() {
    return t('Detach interface');
  }

  get isAsyncAction() {
    return true;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get ports() {
    const { interfaces = [] } = this.store;
    const portsMap = interfaces.map((item) => {
      const name = item.fixed_ips.map((it) => it.ip_address).join(',');
      return {
        ...item,
        name,
        id: item.port_id,
      };
    });
    return portsMap;
  }

  getPorts() {
    this.store.fetchInterfaceList({ id: this.item.id });
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      instance: name,
    };
    return value;
  }

  static policy = 'os_compute_api:os-attach-interfaces:delete';

  static hasInterfaces = (item) => item.fixed_addresses.length > 0;

  static allowed = (item) =>
    Promise.resolve(
      isActiveOrShutOff(item) && this.hasInterfaces(item) && isNotLocked(item)
    );

  get formItems() {
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'interfaces',
        label: t('Network Interface'),
        type: 'select-table',
        required: true,
        datas: this.ports,
        isMulti: true,
        filterParams: [
          {
            label: t('Ip Address'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Ip Address'),
            dataIndex: 'fixed_ips',
            render: (value) =>
              value.map((item) => (
                <div key={item.ip_address}>{item.ip_address}</div>
              )),
          },
          {
            title: t('State'),
            dataIndex: 'port_state',
            render: (value) => portStatus[value] || '-',
          },
          {
            title: t('Mac Address'),
            dataIndex: 'mac_addr',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      interfaces: { selectedRowKeys = [] },
    } = values;
    return this.store.detachInterface({ id, ports: selectedRowKeys });
  };
}
