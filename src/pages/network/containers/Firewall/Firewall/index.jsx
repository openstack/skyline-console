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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalFirewallStore from 'stores/neutron/firewall';
import {
  firewallStatus,
  transitionStatus,
  adminState,
  getDefaultFilter,
} from 'resources/neutron/firewall';
import { getOptions } from 'utils/index';
import actionConfigs from './actions';

export class Firewall extends Base {
  init() {
    this.store = globalFirewallStore;
  }

  get policy() {
    return 'get_firewall_group';
  }

  get name() {
    return t('firewalls');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return transitionStatus;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get initFilter() {
    return {
      notDefault: true,
    };
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('firewallDetail'),
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        isHideable: true,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
      {
        title: t('Ingress Policy'),
        dataIndex: 'ingressPolicyName',
        isLink: true,
        routeName: this.getRouteName('firewallPolicyDetail'),
        idKey: 'ingress_firewall_policy_id',
        isHideable: true,
      },
      {
        title: t('Egress Policy'),
        dataIndex: 'egressPolicyName',
        isLink: true,
        routeName: this.getRouteName('firewallPolicyDetail'),
        idKey: 'egress_firewall_policy_id',
        isHideable: true,
      },
      {
        title: t('Associated Ports'),
        dataIndex: 'ports',
        render: (value) => value.length,
        isHideable: true,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: firewallStatus,
      },
      {
        title: t('Admin State'),
        dataIndex: 'admin_state_up',
        valueMap: adminState,
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(firewallStatus),
        include: false,
      },
      {
        label: t('Admin State'),
        name: 'admin_state_up',
        options: getOptions(adminState),
      },
      getDefaultFilter(t('Hide Default Firewalls')),
    ];
  }
}

export default inject('rootStore')(observer(Firewall));
