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

import globalPortStore from 'stores/neutron/port';
import globalNetworkStore from 'stores/neutron/network';
import { ipValidate } from 'utils/validate';
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { enablePFW } from 'resources/neutron/neutron';
import { isEmpty } from 'lodash';

const { isIPv4 } = ipValidate;

export const floatingIpStatus = {
  AVAILABLE: t('Available'),
  PENDING: t('Pending'),
  ACTIVE: t('Active'),
  ERROR: t('Error'),
  DOWN: t('Down'),
};

export const resourceType = {
  compute: t('Instance'),
  Octavia: t('Load Balancer'),
  'network:router_gateway': t('Router'),
  database: t('Database Instance'),
  null: '-',
};

export const transitionStatuses = ['PENDING'];

/**
 * Make a mapping between subnet_id => router_id based on the port and router information
 * @param portsWithFixedIPs
 * @param routerIdWithExternalNetworkInfo
 * @param shouldHaveExternalGateway
 * @returns {[]}
 */
export function getSubnetToRouter(
  portsWithFixedIPs,
  routerIdWithExternalNetworkInfo,
  shouldHaveExternalGateway = true
) {
  const canReachSubnetIdsWithRouterId = [];
  // Save the information of all subnets and create a mapping of router_id => subnet_id
  portsWithFixedIPs.forEach((port) => {
    const router = routerIdWithExternalNetworkInfo.find((r) => {
      if (shouldHaveExternalGateway && !r.external_gateway_info) {
        return false;
      }
      return r.id === port.device_id;
    });
    if (router) {
      port.fixed_ips.forEach((item) => {
        canReachSubnetIdsWithRouterId.push({
          subnet_id: item.subnet_id,
          router_id: port.device_id,
        });
      });
    }
  });
  return canReachSubnetIdsWithRouterId;
}

export async function getPortsWithFixedIPs() {
  const deviceOwnerList = [
    'network:router_interface_distributed',
    'network:router_interface',
    'network:ha_router_replicated_interface',
  ];
  const portsWithFixedIPs = await globalPortStore.pureFetchList({
    device_owner: deviceOwnerList,
    fields: ['fixed_ips', 'device_id', 'device_owner'],
  });
  return portsWithFixedIPs;
}

/**
 * [{
 *   port_id || id: xxx,
 *   mac_addr || mac_address: xxx,
 *   net_id || network_id: xxx,
 *   fixed_ips: [{
 *     subnet_id: xxx,
 *     fixed_ip_address: xxx,
 *   }]
 * }]
 * @param interfaces
 * @returns {Promise<*[]>}
 */
export async function getInterfaceWithReason(interfaces) {
  const [newInterfaces, networkPromises, floatingIPPromises] =
    await saveAndBuildPromisesFromInterfaces(interfaces);
  const interfacesWithReason =
    await getReasonForExternalNetworkPortOrAlreadyBindFip(
      newInterfaces,
      networkPromises,
      floatingIPPromises
    );
  return interfacesWithReason;
}

export async function saveAndBuildPromisesFromInterfaces(interfaces) {
  const networkPromises = [];
  const floatingIPPromises = [];
  const instanceIPs = [];
  interfaces.forEach((i) => {
    const port_id = i.port_id || i.id;
    const mac_address = i.mac_addr || i.mac_address || '';
    const network_id = i.net_id || i.network_id;
    // Save the subnet information of the interface
    i.fixed_ips.forEach((fixed_ip) => {
      instanceIPs.push({
        // params before '||' used for build self, after is used for list by backend
        port_id,
        fixed_ip_address: fixed_ip.ip_address,
        mac_address,
        subnet_id: fixed_ip.subnet_id,
        network_id,
      });
      networkPromises.push(globalNetworkStore.fetchDetail({ id: network_id }));
      isIPv4(fixed_ip.ip_address)
        ? floatingIPPromises.push(
            globalFloatingIpsStore.pureFetchList({
              fixed_ip_address: fixed_ip.ip_address,
            })
          )
        : floatingIPPromises.push(Promise.resolve([]));
    });
  });
  return [instanceIPs, networkPromises, floatingIPPromises];
}

export async function getReasonForExternalNetworkPortOrAlreadyBindFip(
  interfaces,
  networkPromises,
  floatingIPPromises
) {
  const ret = [...interfaces];
  // get the network names
  const networkDetails = await Promise.all(networkPromises);
  networkDetails.forEach((network, index) => {
    ret[index].network_name = network.name;
    // ret[index]['router:external'] = network['router:external'];
  });
  // check whether it is the port of the external network
  const externalNetworks = await globalNetworkStore.pureFetchList({
    'router:external': true,
  });
  ret.forEach((i) => {
    if (isExternalNetwork()) {
      i['router:external'] = true;
    } else {
      i['router:external'] = false;
    }
    function isExternalNetwork() {
      return externalNetworks.some((extNetwork) =>
        extNetwork.subnets.includes(i.subnet_id)
      );
    }
  });

  // check whether a FIP has been bound
  const floatingIPs = await Promise.all(floatingIPPromises);
  floatingIPs.forEach((floatingip, index) => {
    ret[index].floatingIP =
      (floatingip[0] &&
        floatingip[0].port_id === ret[index].port_id &&
        floatingip[0].floating_ip_address) ||
      '';
  });
  return ret;
}

/**
 * get all fips from router id
 * @param router
 * @returns {Promise<*[]|*>}
 */
export async function getFipsFromRouterId(router) {
  const { routerIdWithExternalNetworkInfo } = this.state;
  // get the external_network_id of the route from the current router
  const info = routerIdWithExternalNetworkInfo.find(
    (i) => i.id === router.router_id
  );
  if (!info.external_gateway_info) {
    return [];
  }
  const external_network_id = info.external_gateway_info.network_id;
  // get all the FIPs of the external network which connected to the current router
  const fips = await globalFloatingIpsStore.pureFetchList({
    floating_network_id: external_network_id,
    status: 'DOWN',
    project_id: this.currentProjectId,
  });
  // get the external network's name
  const external_network_info = await globalNetworkStore.fetchDetail({
    id: external_network_id,
  });
  return fips
    .filter((fip) => !fip.fixed_ip_address && !fip.port_details)
    .map((fip) => {
      fip.network_name = external_network_info.name;
      fip.name = fip.floating_ip_address;
      return fip;
    });
}

export async function handleFixedIPChange(e) {
  this.setState({
    fipLoading: true,
  });
  const { canReachSubnetIdsWithRouterId } = this.state;
  if (!e.selectedRows.length) {
    this.setState({
      fixed_ip: null,
      canAssociateFloatingIPs: [],
      fipLoading: false,
    });
  }
  const item = e.selectedRows[0];
  const totalFips = [];
  // Consider that one subnet can connect to multi routes, and the routes can open diffent external gateways.
  // Get the id of the route where the subnet is located from the subnet of the interface
  const routerIds = canReachSubnetIdsWithRouterId.filter(
    (i) => i.subnet_id === item.subnet_id
  );
  const results = await Promise.all(
    routerIds.map((router) => getFipsFromRouterId.call(this, router))
  );
  results.forEach((fips) => {
    totalFips.push(...fips);
  });
  const fipMap = {};
  totalFips.forEach((fip) => {
    fipMap[fip.id] = fip;
  });
  const norepeatFips = Object.values(fipMap);
  this.setState({
    fixed_ip: item,
    canAssociateFloatingIPs: norepeatFips,
    fipLoading: false,
  });
}

export const getFixedIPFormItemForAssociate = (label, self) => {
  const { portLoading } = self.state;
  return {
    name: 'fixed_ip',
    label,
    type: 'select-table',
    required: true,
    data: self.ports,
    isLoading: portLoading,
    isMulti: false,
    filterParams: [
      {
        label: t('Ip Address'),
        name: 'name',
      },
    ],
    columns: [
      {
        title: t('Ip Address'),
        dataIndex: 'name',
      },
      {
        title: t('Mac Address'),
        dataIndex: 'mac_address',
      },
      {
        title: t('Network'),
        dataIndex: 'network_name',
      },
      {
        title: t('Subnet ID'),
        dataIndex: 'subnet_id',
      },
      {
        title: t('Reason'),
        dataIndex: 'reason',
      },
    ],
    disabledFunc: (record) => !record.available,
    onChange: self.handleFixedIPChange,
  };
};

export const getFIPFormItemExtra = () => {
  if (enablePFW()) {
    return t(
      'The floating IP configured with port forwardings cannot be bound'
    );
  }
  return '';
};

export const disableFIPAssociate = (record) => {
  const pfws = record.port_forwardings || [];
  return !!pfws.length;
};

export const getFIPFormItemForAssociate = (self) => {
  const { canAssociateFloatingIPs, fipLoading } = self.state;
  return {
    name: 'fip',
    label: t('Floating Ip Address'),
    type: 'select-table',
    required: true,
    data: canAssociateFloatingIPs,
    isLoading: fipLoading,
    isMulti: false,
    extra: self.getFIPFormItemExtra(),
    disabledFunc: self.disableFIPAssociate,
    filterParams: [
      {
        label: t('Floating Ip Address'),
        name: 'name',
      },
    ],
    columns: [
      {
        title: t('Floating Ip Address'),
        dataIndex: 'name',
      },
      {
        title: t('Network'),
        dataIndex: 'network_name',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'sinceTime',
      },
    ],
  };
};

export const portForwardingProtocols = {
  tcp: t('TCP'),
  udp: t('UDP'),
};

export const getPortForwardingName = (portForwarding = {}, fip = '') => {
  if (isEmpty(portForwarding)) {
    return '';
  }
  const {
    protocol,
    external_port,
    external_port_range,
    internal_ip_address,
    internal_port,
    internal_port_range,
  } = portForwarding;
  const protocolLabel = portForwardingProtocols[protocol] || protocol;
  const name = `${
    external_port || external_port_range
  } => ${internal_ip_address}:${internal_port || internal_port_range}`;
  const longName = fip ? `${fip}:${name}` : name;
  return `${protocolLabel}: ${longName}`;
};
