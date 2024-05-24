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

import BaseLayout from 'layouts/Basic';
import E404 from 'pages/base/containers/404';
import Network from '../containers/Network';
import AdminNetwork from '../containers/Network/Network';
import NetworkDetail from '../containers/Network/Detail';
import SubnetDetail from '../containers/Subnet/Detail';
import Router from '../containers/Router';
import FloatingIp from '../containers/FloatingIp';
import FloatingIpDetail from '../containers/FloatingIp/Detail';
import Topology from '../containers/Topology';
import RouterDetail from '../containers/Router/Detail';
import RouterPortDetail from '../containers/Router/Port/Detail';
import Port from '../containers/Port';
import PortDetail from '../containers/Port/Detail';
import QoSPolicy from '../containers/QoSPolicy';
import AdminQoSPolicy from '../containers/QoSPolicy/QoSPolicy';
import QoSPolicyDetail from '../containers/QoSPolicy/Detail';
import LoadBalancers from '../containers/LoadBalancers/LoadBalancerInstance';
import StepCreateLoadBalancer from '../containers/LoadBalancers/LoadBalancerInstance/actions/StepCreate';
import LoadBalancerDetail from '../containers/LoadBalancers/LoadBalancerInstance/Detail';
import ListenerDetail from '../containers/LoadBalancers/Listener/Detail';
import VPN from '../containers/VPN';
import IPsecSiteConnectionDetail from '../containers/VPN/IPsecSiteConnection/Detail';
import SecurityGroups from '../containers/SecurityGroup';
import SecurityGroupDetail from '../containers/SecurityGroup/Detail';
import Certificate from '../containers/Certificate';
import CertificateDetailContainer from '../containers/Certificate/Detail/Container';
import CertificateDetailSecret from '../containers/Certificate/Detail/Secret';
import Reverse from '../containers/DNS/Reverse';
import ReverseDetail from '../containers/DNS/Reverse/Detail';
import Zones from '../containers/DNS/Zones';
import ZonesDetail from '../containers/DNS/Zones/Detail';
import RecordSetDetail from '../containers/DNS/Zones/Detail/RecordSets/Detail';
import Firewall from '../containers/Firewall';
import FirewallDetail from '../containers/Firewall/Firewall/Detail';
import FirewallPortDetail from '../containers/Firewall/Firewall/Detail/PortDetail';
import PolicyDetail from '../containers/Firewall/Policy/Detail';
import RuleCreate from '../containers/Firewall/Rule/actions/Create';
import RuleEdit from '../containers/Firewall/Rule/actions/Edit';
import RuleDetail from '../containers/Firewall/Rule/Detail';
import PolicyCreate from '../containers/Firewall/Policy/actions/Create';
import PolicyEdit from '../containers/Firewall/Policy/actions/Edit';
import FirewallCreate from '../containers/Firewall/Firewall/actions/Create';
import RbacPolicies from '../containers/RbacPolicies';
import RbacPolicyDetail from '../containers/RbacPolicies/Detail';

const PATH = '/network';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/networks`, component: Network, exact: true },
      { path: `${PATH}/networks-admin`, component: AdminNetwork, exact: true },
      {
        path: `${PATH}/networks/detail/:id`,
        component: NetworkDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks-admin/detail/:id`,
        component: NetworkDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks/detail/:networkId/subnet/:id`,
        component: SubnetDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks-admin/detail/:networkId/subnet/:id`,
        component: SubnetDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks/detail/:networkId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks-admin/detail/:networkId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks/detail/:networkId/subnet/:subnetId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/networks-admin/detail/:networkId/subnet/:subnetId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/instance/detail/:instanceId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/instance-admin/detail/:instanceId/port/:id`,
        component: PortDetail,
        exact: true,
      },
      { path: `${PATH}/router`, component: Router, exact: true },
      { path: `${PATH}/router-admin`, component: Router, exact: true },
      {
        path: `${PATH}/router/detail/:id`,
        component: RouterDetail,
        exact: true,
      },
      {
        path: `${PATH}/router-admin/detail/:id`,
        component: RouterDetail,
        exact: true,
      },
      {
        path: `${PATH}/router/:routerId/port/:id`,
        component: RouterPortDetail,
        exact: true,
      },
      {
        path: `${PATH}/router-admin/:routerId/port/:id`,
        component: RouterPortDetail,
        exact: true,
      },
      { path: `${PATH}/floatingip`, component: FloatingIp, exact: true },
      { path: `${PATH}/floatingip-admin`, component: FloatingIp, exact: true },
      {
        path: `${PATH}/floatingip/detail/:id`,
        component: FloatingIpDetail,
        exact: true,
      },
      {
        path: `${PATH}/floatingip-admin/detail/:id`,
        component: FloatingIpDetail,
        exact: true,
      },
      {
        path: `${PATH}/port`,
        component: Port,
        exact: true,
      },
      {
        path: `${PATH}/port-admin`,
        component: Port,
        exact: true,
      },
      {
        path: `${PATH}/port/detail/:id`,
        component: PortDetail,
        exact: true,
      },
      {
        path: `${PATH}/port-admin/detail/:id`,
        component: PortDetail,
        exact: true,
      },
      { path: `${PATH}/qos-policy`, component: QoSPolicy, exact: true },
      {
        path: `${PATH}/qos-policy-admin`,
        component: AdminQoSPolicy,
        exact: true,
      },
      {
        path: `${PATH}/qos-policy/detail/:id`,
        component: QoSPolicyDetail,
        exact: true,
      },
      {
        path: `${PATH}/qos-policy-admin/detail/:id`,
        component: QoSPolicyDetail,
        exact: true,
      },
      { path: `${PATH}/topo`, component: Topology, exact: true },
      { path: `${PATH}/load-balancers`, component: LoadBalancers, exact: true },
      {
        path: `${PATH}/load-balancers-admin`,
        component: LoadBalancers,
        exact: true,
      },
      {
        path: `${PATH}/load-balancers/create`,
        component: StepCreateLoadBalancer,
        exact: true,
      },
      {
        path: `${PATH}/load-balancers/detail/:id`,
        component: LoadBalancerDetail,
        exact: true,
      },
      {
        path: `${PATH}/load-balancers-admin/detail/:id`,
        component: LoadBalancerDetail,
        exact: true,
      },
      {
        path: `${PATH}/load-balancers/:loadBalancerId/listener/:id`,
        component: ListenerDetail,
        exact: true,
      },
      {
        path: `${PATH}/load-balancers-admin/:loadBalancerId/listener/:id`,
        component: ListenerDetail,
        exact: true,
      },
      { path: `${PATH}/certificate`, component: Certificate, exact: true },
      {
        path: `${PATH}/certificate-container/detail/:id`,
        component: CertificateDetailContainer,
        exact: true,
      },
      {
        path: `${PATH}/certificate-secret/detail/:id`,
        component: CertificateDetailSecret,
        exact: true,
      },
      { path: `${PATH}/vpn`, component: VPN, exact: true },
      {
        path: `${PATH}/ipsec-site-connection/detail/:id`,
        component: IPsecSiteConnectionDetail,
        exact: true,
      },
      {
        path: `${PATH}/ipsec-site-connection-admin/detail/:id`,
        component: IPsecSiteConnectionDetail,
        exact: true,
      },
      { path: `${PATH}/vpn-admin`, component: VPN, exact: true },
      {
        path: `${PATH}/security-group`,
        component: SecurityGroups,
        exact: true,
      },
      {
        path: `${PATH}/security-group-admin`,
        component: SecurityGroups,
        exact: true,
      },
      {
        path: `${PATH}/security-group/detail/:id`,
        component: SecurityGroupDetail,
        exact: true,
      },
      {
        path: `${PATH}/security-group-admin/detail/:id`,
        component: SecurityGroupDetail,
        exact: true,
      },
      { path: `${PATH}/dns/zones`, component: Zones, exact: true },
      { path: `${PATH}/dns-admin/zones`, component: Zones, exact: true },
      {
        path: `${PATH}/dns/zones/detail/:id`,
        component: ZonesDetail,
        exact: true,
      },
      {
        path: `${PATH}/dns-admin/zones/detail/:id`,
        component: ZonesDetail,
        exact: true,
      },
      {
        path: `${PATH}/dns/zones/detail/:zoneId/recordsets/:id`,
        component: RecordSetDetail,
        exact: true,
      },
      {
        path: `${PATH}/dns-admin/zones/detail/:zoneId/recordsets/:id`,
        component: RecordSetDetail,
        exact: true,
      },
      { path: `${PATH}/dns/reverse`, component: Reverse, exact: true },
      {
        path: `${PATH}/dns/reverse/detail/:id`,
        component: ReverseDetail,
        exact: true,
      },
      { path: `${PATH}/firewall`, component: Firewall, exact: true },
      {
        path: `${PATH}/firewall/:firewallId/port/:id`,
        component: FirewallPortDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-admin/:firewallId/port/:id`,
        component: FirewallPortDetail,
        exact: true,
      },
      { path: `${PATH}/firewall-admin`, component: Firewall, exact: true },
      {
        path: `${PATH}/firewall/detail/:id`,
        component: FirewallDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-admin/detail/:id`,
        component: FirewallDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-policy/detail/:id`,
        component: PolicyDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-policy-admin/detail/:id`,
        component: PolicyDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-rule/create`,
        component: RuleCreate,
        exact: true,
      },
      {
        path: `${PATH}/firewall-rule/edit/:id`,
        component: RuleEdit,
        exact: true,
      },
      {
        path: `${PATH}/firewall-rule/detail/:id`,
        component: RuleDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall-rule-admin/detail/:id`,
        component: RuleDetail,
        exact: true,
      },
      {
        path: `${PATH}/firewall/create`,
        component: FirewallCreate,
        exact: true,
      },
      {
        path: `${PATH}/firewall-policy/add`,
        component: PolicyCreate,
        exact: true,
      },
      {
        path: `${PATH}/firewall-policy/edit/:id`,
        component: PolicyEdit,
        exact: true,
      },
      {
        path: `${PATH}/rbac-policies-admin`,
        component: RbacPolicies,
        exact: true,
      },
      {
        path: `${PATH}/rbac-policies-admin/detail/:id`,
        component: RbacPolicyDetail,
        exact: true,
      },
      { path: '*', component: E404 },
    ],
  },
];
