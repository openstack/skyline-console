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
import { FormAction } from 'containers/Action';
import globalFirewallStore from 'stores/neutron/firewall';
import globalFirewallPolicyStore from 'stores/neutron/firewall-policy';
import globalRouterStore from 'stores/neutron/router';
import globalNetworkStore from 'stores/neutron/network';
import globalPortStore from 'stores/neutron/port';
import { tableOptions } from 'resources/neutron/firewall-policy';
import {
  routerInterfaceOwners,
  tableOptions as portTableOptions,
} from 'resources/neutron/firewall-port';
import { instancePortOptions } from 'resources/neutron/port';
import { toJS } from 'mobx';
import {
  fetchNeutronQuota,
  getQuotaInfo,
  checkQuotaDisable,
} from 'resources/neutron/network';

const quotaKeys = ['firewall_group'];
const wishes = [1];

export class CreateForm extends FormAction {
  init() {
    this.store = globalFirewallStore;
    this.policyStore = globalFirewallPolicyStore;
    this.routerStore = globalRouterStore;
    this.networkStore = globalNetworkStore;
    this.portStore = globalPortStore;
    this.getNetworks();
    this.getRouters();
    this.getPolicies();
    this.getPorts();
    fetchNeutronQuota(this);
  }

  static id = 'firewall-create';

  static title = t('Create Firewall');

  static path = '/network/firewall/create';

  get listUrl() {
    return this.getRoutePath('firewall');
  }

  get name() {
    return t('Create firewall');
  }

  static policy = 'create_firewall_group';

  static allowed() {
    return Promise.resolve(true);
  }

  get disableSubmit() {
    return checkQuotaDisable(quotaKeys, wishes);
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    return getQuotaInfo(this, quotaKeys, wishes);
  }

  getNetworks() {
    this.networkStore.fetchList({ isFirewall: true });
  }

  getRouters() {
    this.routerStore.fetchList({ isFirewall: true });
  }

  getPolicies() {
    this.policyStore.fetchList();
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
        port.network_name = port.network ? port.network.name : '';
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

  get policies() {
    return (this.policyStore.list.data || [])
      .filter((it) => it.firewalls.length < 2)
      .map((it) => ({
        ...it,
        key: it.id,
      }));
  }

  get defaultValue() {
    return {
      options: {
        admin_state_up: true,
      },
    };
  }

  get instancePorts() {
    return toJS(this.portStore.list.data || []).map((it) => ({
      ...it,
      name: it.name || it.id,
    }));
  }

  get portTabs() {
    const routePortTab = {
      title: t('Router Port'),
      key: 'router',
      props: {
        data: this.ports,
        ...portTableOptions,
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
      routePortTab,
    ];
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'ingressPolicy',
        label: t('Ingress Policy'),
        type: 'select-table',
        data: this.policies,
        isLoading: this.policyStore.list.isLoading,
        isMulti: false,
        ...tableOptions,
      },
      {
        name: 'egressPolicy',
        label: t('Egress Policy'),
        type: 'select-table',
        data: this.policies,
        isLoading: this.policyStore.list.isLoading,
        isMulti: false,
        ...tableOptions,
      },
      {
        name: 'ports',
        label: t('Ports'),
        type: 'tab-select-table',
        tabs: this.portTabs,
      },
      {
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          { label: t('Admin State'), value: 'admin_state_up' },
          // { label: t('Shared'), value: 'shared' },
        ],
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const {
      ingressPolicy = {},
      egressPolicy = {},
      options: { admin_state_up = true, shared = false } = {},
      ports = {},
      ...rest
    } = values;
    const ingress =
      ingressPolicy.selectedRowKeys && ingressPolicy.selectedRowKeys[0];
    const egress =
      egressPolicy.selectedRowKeys && egressPolicy.selectedRowKeys[0];
    const body = {
      admin_state_up,
      shared,
      ...rest,
    };
    if (ingress) {
      body.ingress_firewall_policy_id = ingress;
    }
    if (egress) {
      body.egress_firewall_policy_id = egress;
    }
    if (ports.selectedRowKeys) {
      body.ports = ports.selectedRowKeys;
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(CreateForm));
