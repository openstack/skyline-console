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
import { portStatus } from 'resources/neutron/port';
import { isActiveOrShutOff, isNotLocked } from 'resources/nova/instance';

export class DetachInterface extends ModalAction {
  static id = 'detach-interface';

  static title = t('Detach Interface');

  init() {
    this.store = new ServerStore();
    this.getPorts();
    this.state.portLoading = true;
    this.state.autoSelectInterface = null;
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

  async getPorts() {
    await this.store.fetchInterfaceList({ id: this.item.id });
    this.setState({
      portLoading: false,
    });

    if (this.ports && this.ports.length === 1) {
      const [{ id }] = this.ports;
      const selected = { selectedRowKeys: [id] };

      this.setState({ autoSelectInterface: selected }, () => {
        const setForm = () =>
          this.formRef?.current?.setFieldsValue({ interfaces: selected });
        if (!setForm()) {
          Promise.resolve().then(setForm);
        }
      });
    }
  }

  get defaultValue() {
    const { name } = this.item;
    return {
      instance: name,
    };
  }

  static policy = 'os_compute_api:os-attach-interfaces:delete';

  static hasInterfaces = (item) => item.fixed_addresses.length > 0;

  static allowed = (item) =>
    Promise.resolve(
      isActiveOrShutOff(item) && this.hasInterfaces(item) && isNotLocked(item)
    );

  get formItems() {
    const { portLoading, autoSelectInterface } = this.state;
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
        data: this.ports,
        isLoading: portLoading,
        isMulti: true,
        initValue: autoSelectInterface || {},
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
            valueMap: portStatus,
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

export default inject('rootStore')(observer(DetachInterface));
