import globalFloatingIpsStore from './neutron/floatingIp';
import globalImageStore from './glance/image';
import globalServerStore from './nova/instance';
import globalInstanceSnapshotStore from './glance/instance-snapshot';
import globalKeypairStore from './nova/keypair';
import globalNetworkStore from './neutron/network';
import globalPortForwardingStore from './neutron/port-forwarding';
import globalQoSPolicyStore from './neutron/qos-policy';
import globalRecycleBinStore from './skyline/recycle-server';
import globalSecurityGroupStore from './neutron/security-group';
import globalSecurityGroupRuleStore from './neutron/security-rule';
import globalServerGroupStore from './nova/server-group';
import globalSnapshotStore from './cinder/snapshot';
import globalStaticRouteStore from './neutron/static-route';
import globalSubnetStore from './neutron/subnet';
import globalVirtualAdapterStore from './neutron/virtual-adapter';
import globalVolumeStore from './cinder/volume';
import globalComputeHostStore from './nova/compute-host';
import globalHypervisorStore from './nova/hypervisor';
import globalStackStore from './heat/stack';

export default {
  globalFloatingIpsStore,
  globalImageStore,
  globalServerStore,
  globalInstanceSnapshotStore,
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
  globalVirtualAdapterStore,
  globalVolumeStore,
  globalComputeHostStore,
  globalHypervisorStore,
  globalStackStore,
};
