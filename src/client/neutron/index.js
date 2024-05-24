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

import Base from '../client/base';
import { neutronBase } from '../client/constants';

export class NeutronClient extends Base {
  get baseUrl() {
    return neutronBase();
  }

  get resources() {
    return [
      {
        key: 'networks',
        responseKey: 'network',
        subResources: [
          {
            name: 'dhcpAgents',
            key: 'dhcp-agents',
          },
        ],
      },
      {
        key: 'subnets',
        responseKey: 'subnet',
      },
      {
        key: 'ports',
        responseKey: 'port',
      },
      {
        key: 'routers',
        responseKey: 'router',
        extendOperations: [
          {
            name: 'addRouterInterface',
            key: 'add_router_interface',
            method: 'put',
          },
          {
            name: 'removeRouterInterface',
            key: 'remove_router_interface',
            method: 'put',
          },
          {
            name: 'addExtraRoutes',
            key: 'add_extraroutes',
            method: 'put',
          },
          {
            name: 'removeExtraRoutes',
            key: 'remove_extraroutes',
            method: 'put',
          },
        ],
      },
      {
        key: 'floatingips',
        responseKey: 'floatingip',
        subResources: [
          {
            name: 'portForwardings',
            key: 'port_forwardings',
            responseKey: 'port_forwarding',
          },
        ],
      },
      {
        key: 'extensions',
        responseKey: 'extensions',
      },
      {
        key: 'agents',
        responseKey: 'agent',
        subResources: [
          {
            name: 'dhcpNetworks',
            key: 'dhcp-networks',
            responseKey: 'network',
          },
          {
            name: 'l3Routers',
            key: 'l3-routers',
            responseKey: 'router',
          },
        ],
      },
      {
        name: 'rbacPolicies',
        key: 'rbac-policies',
        responseKey: 'rbac_policy',
      },
      {
        name: 'firewalls',
        key: 'fwaas/firewall_groups',
        responseKey: 'firewall_group',
      },
      {
        name: 'firewallPolicies',
        key: 'fwaas/firewall_policies',
        responseKey: 'firewall_policy',
        extendOperations: [
          {
            name: 'insertRule',
            key: 'insert_rule',
            method: 'put',
          },
          {
            name: 'removeRule',
            key: 'remove_rule',
            method: 'put',
          },
        ],
      },
      {
        name: 'firewallRules',
        key: 'fwaas/firewall_rules',
        responseKey: 'firewall_rule',
      },
      {
        name: 'networkIpAvailabilities',
        key: 'network-ip-availabilities',
      },
      {
        name: 'azones',
        key: 'availability_zones',
      },
      {
        name: 'qosPolicies',
        key: 'qos/policies',
        responseKey: 'policy',
        subResources: [
          {
            name: 'bandwidthLimitRules',
            key: 'bandwidth_limit_rules',
          },
          {
            name: 'dscpMarkingRules',
            key: 'dscp_marking_rules',
          },
        ],
      },
      {
        name: 'securityGroups',
        key: 'security-groups',
        responseKey: 'security_group',
      },
      {
        name: 'securityGroupRules',
        key: 'security-group-rules',
        responseKey: 'security_group_rule',
      },
      {
        key: 'subnets',
        responseKey: 'subnet',
      },
      {
        name: 'endpointGroups',
        key: 'endpoint-groups',
        responseKey: 'endpoint_group',
      },
      {
        name: 'ikePolicies',
        key: 'ikepolicies',
        responseKey: 'ikepolicy',
      },
      {
        name: 'ipsecPolicies',
        key: 'ipsecpolicies',
        responseKey: 'ipsecpolicy',
      },
      {
        name: 'ipsecSiteConnections',
        key: 'ipsec_site_connections',
        responseKey: 'ipsec_site_connection',
      },
      {
        key: 'vpnservices',
        responseKey: 'vpnservice',
      },
      {
        key: 'quotas',
        responseKey: 'quota',
        extendOperations: [
          {
            key: 'details',
          },
        ],
      },
    ];
  }
}

const neutronClient = new NeutronClient();
export default neutronClient;
