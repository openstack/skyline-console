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
import globalNetworkStore from 'stores/neutron/network';
import globalFirewallStore from 'stores/neutron/firewall';
import globalPortStore from 'stores/neutron/port';
import { ModalAction } from 'containers/Action';
import {
  routerInterfaceOwners,
  tableOptions,
} from 'resources/neutron/firewall-port';
import { instancePortOptions } from 'resources/neutron/port';
import { toJS } from 'mobx';
import { isMine } from 'resources/neutron/firewall';

export class ManagePort extends ModalAction {
  static id = 'manage-port';

  static title = t('Manage Ports');

  init() {
    this.store = globalFirewallStore;
    this.routerStore = globalRouterStore;
    this.networkStore = globalNetworkStore;
    this.portStore = globalPortStore;
    this.getNetworks();
    this.getRouters();
    this.getPorts();
  }

  static policy = 'update_firewall_group';

  get name() {
    return t('manage ports');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  async getNetworks() {
    this.networkStore.fetchList({ isFirewall: true });
    this.updateDefaultValue();
  }

  async getRouters() {
    this.routerStore.fetchList({ isFirewall: true });
    this.updateDefaultValue();
  }

  async getPorts() {
    this.portStore.fetchList({
      device_owner: 'compute:nova',
      project_id: this.currentProjectId,
    });
    this.updateDefaultValue();
  }

  get networks() {
    return toJS(this.networkStore.list.data || []);
  }

  get ports() {
    let ports = [];
    (toJS(this.routerStore.list.data) || []).forEach((it) => {
      const routerPorts = it.ports.filter((port) =>
        routerInterfaceOwners.includes(port.device_owner)
      );
      routerPorts.forEach((port) => {
        port.device_name = it.name;
        port.owner = t('Router');
        port.network = this.networks.find(
          (network) => network.id === port.network_id
        );
        port.router = it;
        port.network_name = port.network ? port.network.name : '-';
        port.name = port.id;
        port.ip_address = port.fixed_ips[0].ip_address;
        port.subnet = port.network
          ? port.network.subnetDetails.find(
              (subnet) => subnet.id === port.fixed_ips[0].subnet_id
            )
          : null;
        port.subnet_name = (port.subnet && port.subnet.name) || '-';
      });
      ports = [...ports, ...routerPorts];
    });
    return ports;
  }

  get instancePorts() {
    return toJS(this.portStore.list.data || []).map((it) => ({
      ...it,
      name: it.name || it.id,
    }));
  }

  get portTabs() {
    const routerPortTab = {
      title: t('Router Port'),
      key: 'router',
      props: {
        data: this.ports,
        ...tableOptions,
        isLoading: this.routerStore.list.isLoading,
        isMulti: true,
      },
    };
    return [
      {
        title: t('Instance Port'),
        key: 'instance',
        props: {
          data: this.instancePorts,
          ...instancePortOptions(this),
          isLoading: this.portStore.list.isLoading,
          isMulti: true,
        },
      },
      routerPortTab,
    ];
  }

  static allowed = (item) => Promise.resolve(isMine(item));

  get defaultValue() {
    return {
      name: this.item.name,
      ports: {
        selectedRows: this.item.ports.map((it) => ({
          id: it,
          name: it,
        })),
        selectedRowKeys: this.item.ports,
      },
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'firewall',
      },
      {
        name: 'ports',
        label: t('Ports'),
        type: 'tab-select-table',
        tabs: this.portTabs,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { ports } = values;
    const body = {
      ports: ports.selectedRowKeys || null,
    };
    return this.store.edit({ id }, body);
  };
}

export default inject('rootStore')(observer(ManagePort));
