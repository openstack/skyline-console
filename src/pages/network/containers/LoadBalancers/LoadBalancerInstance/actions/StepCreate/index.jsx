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
import { StepAction } from 'containers/Action';
import globalLbaasStore from 'stores/octavia/loadbalancer';
import { getInsertHeadersValueFromForm } from 'resources/octavia/lb';
import BaseStep from './BaseStep';
import ListenerStep from '../../../StepCreateComponents/ListenerStep';
import PoolStep from '../../../StepCreateComponents/PoolStep';
import MemberStep from '../../../StepCreateComponents/MemberStep';
import HealthMonitorStep from '../../../StepCreateComponents/HealthMonitorStep';

export class StepCreate extends StepAction {
  static id = 'lb-create';

  static title = t('Create Loadbalancer');

  static path = '/network/load-balancers/create';

  init() {
    this.store = globalLbaasStore;
  }

  static policy = 'os_load-balancer_api:loadbalancer:post';

  static allowed(_, containerProps) {
    const { isAdminPage = false } = containerProps;
    return Promise.resolve(!isAdminPage);
  }

  get name() {
    return t('Create Loadbalancer');
  }

  get listUrl() {
    return this.getRoutePath('lb');
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t('Base Config'),
        component: BaseStep,
      },
      {
        title: t('Listener Detail'),
        component: ListenerStep,
      },
      {
        title: t('Pool Detail'),
        component: PoolStep,
      },
      {
        title: t('Member Detail'),
        component: MemberStep,
      },
      {
        title: t('Health Monitor Detail'),
        component: HealthMonitorStep,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      name,
      description,
      vip_address,
      vip_network_id,
      admin_state_enabled,
      enableHealthMonitor,
      listener_protocol,
      listener_ssl_parsing_method,
      listener_sni_enabled,
      listener_default_tls_container_ref,
      listener_client_ca_tls_container_ref,
      listener_sni_container_refs,
      listener_admin_state_up,
      pool_admin_state_up,
      monitor_admin_state_up,
      insert_headers,
      flavor_id,
      provider,
      health_url_path,
      ...rest
    } = values;
    const data = {
      name,
      description,
      vip_network_id: vip_network_id.selectedRowKeys[0],
    };
    const { ip_address, subnet: vip_subnet_id } = vip_address[0];
    data.vip_subnet_id = vip_subnet_id;
    if (ip_address && ip_address.ip) {
      data.vip_address = ip_address.ip;
    }
    data.admin_state_up = admin_state_enabled;
    if (provider) {
      data.provider = provider;
    }
    if (provider !== 'ovn' && flavor_id?.selectedRowKeys?.length) {
      data.flavor_id = flavor_id.selectedRowKeys[0];
    }

    const listenerData = {
      admin_state_up: listener_admin_state_up,
      protocol: listener_protocol,
    };

    const insertHeaders = getInsertHeadersValueFromForm(insert_headers);
    if (provider !== 'ovn' && insertHeaders) {
      listenerData.insert_headers = insertHeaders;
    }

    if (listener_protocol === 'TERMINATED_HTTPS') {
      if (listener_default_tls_container_ref) {
        listenerData.default_tls_container_ref =
          listener_default_tls_container_ref.selectedRows[0].container_ref;
      }
      if (
        listener_ssl_parsing_method === 'two-way' &&
        listener_client_ca_tls_container_ref
      ) {
        listenerData.client_ca_tls_container_ref =
          listener_client_ca_tls_container_ref.selectedRows[0].secret_ref;
        listenerData.client_authentication = 'MANDATORY';
      }
      if (listener_sni_enabled && listener_sni_container_refs) {
        listenerData.sni_container_refs =
          listener_sni_container_refs.selectedRows.map(
            (it) => it.container_ref
          );
      }
    }

    const poolData = { admin_state_up: pool_admin_state_up };
    const healthMonitorData = {
      admin_state_up: monitor_admin_state_up,
    };

    Object.keys(rest).forEach((i) => {
      if (i.indexOf('listener') === 0) {
        listenerData[i.replace('listener_', '')] = values[i];
      } else if (i.indexOf('pool') === 0) {
        poolData[i.replace('pool_', '')] = values[i];
      } else if (i.indexOf('health') === 0) {
        healthMonitorData[i.replace('health_', '')] = values[i];
      }
    });

    if (enableHealthMonitor) {
      const healthMonitorPayload = { ...healthMonitorData };

      // Only add url_path if provider is not OVN and type is not TCP or UDP-CONNECT
      if (
        provider !== 'ovn' &&
        healthMonitorData.type !== 'TCP' &&
        healthMonitorData.type !== 'UDP-CONNECT'
      ) {
        healthMonitorPayload.url_path =
          health_url_path === '' || health_url_path == null
            ? '/'
            : health_url_path;
      }

      poolData.healthmonitor = healthMonitorPayload;
    }
    const {
      extMembers = [],
      Member: {
        selectedRowKeys: keys = [],
        selectedRows,
        memberUpdateValue = [],
      } = {},
    } = rest;
    const memberData = [];
    keys.forEach((id) => {
      const selectedMember = selectedRows.filter((it) => it.id === id)[0];
      const inputData = memberUpdateValue.filter((it) => it.id === id)[0];
      const { weight = 0, protocol_port = 1 } = inputData || {};
      const { member_ip, fixed_ips = [] } = selectedMember;
      member_ip.forEach((address) => {
        const { subnet_id = undefined } = fixed_ips.filter(
          (it) => it.ip_address === address
        )[0];
        const addMember = {
          weight,
          protocol_port,
          address,
          subnet_id,
        };
        memberData.push(addMember);
      });
    });

    extMembers.forEach((member) => {
      const {
        ip,
        protocol_port,
        weight,
        name: server_name = null,
        subnet_id,
      } = member.ip_address;
      const addMember = {
        weight,
        protocol_port,
        address: ip,
        name: server_name,
        subnet_id,
      };
      memberData.push(addMember);
    });
    poolData.members = memberData;
    listenerData.default_pool = poolData;
    data.listeners = [listenerData];

    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(StepCreate));
