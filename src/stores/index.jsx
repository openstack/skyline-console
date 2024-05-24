import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import globalImageStore from 'stores/glance/image';
import globalServerStore from 'stores/nova/instance';
import globalKeypairStore from 'stores/nova/keypair';
import globalNetworkStore from 'stores/neutron/network';
import globalPortForwardingStore from 'stores/neutron/port-forwarding';
import globalQoSPolicyStore from 'stores/neutron/qos-policy';
import globalRecycleBinStore from 'stores/skyline/recycle-server';
import globalSecurityGroupStore from 'stores/neutron/security-group';
import globalSecurityGroupRuleStore from 'stores/neutron/security-rule';
import globalServerGroupStore from 'stores/nova/server-group';
import globalSnapshotStore from 'stores/cinder/snapshot';
import globalStaticRouteStore from 'stores/neutron/static-route';
import globalSubnetStore from 'stores/neutron/subnet';
import globalPortStore from 'stores/neutron/port-extension';
import globalVolumeStore from 'stores/cinder/volume';
import globalComputeHostStore from 'stores/nova/compute-host';
import globalHypervisorStore from 'stores/nova/hypervisor';
import globalStackStore from 'stores/heat/stack';
import globalRbacPoliciesStore from 'stores/neutron/rbac-policies';

export default {
  globalFloatingIpsStore,
  globalImageStore,
  globalServerStore,
  globalKeypairStore,
  globalNetworkStore,
  globalPortForwardingStore,
  globalQoSPolicyStore,
  globalRecycleBinStore,
  globalSecurityGroupStore,
  globalSecurityGroupRuleStore,
  globalServerGroupStore,
  globalSnapshotStore,
  globalStaticRouteStore,
  globalSubnetStore,
  globalVolumeStore,
  globalComputeHostStore,
  globalHypervisorStore,
  globalStackStore,
  globalPortStore,
  globalRbacPoliciesStore,
};
