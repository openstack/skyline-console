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

const { isIPv4 } = ipValidate;

export const floatingIpStatus = {
  AVAILABLE: t('Available'),
  PENDING: t('Pending'),
  ACTIVE: t('Active'),
  ERROR: t('Error'),
  DOWN: t('Down'),
};

export const resouceType = {
  compute: t('Instance'),
  Octavia: t('Load Balancer'),
  'network:router_gateway': t('Router'),
  database: t('Database Instance'),
  null: '-',
};

export const transitionStatuses = ['PENDING'];

/**
 * 通过port和router信息，构建subnet_id => router_id的映射关系
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
  // 将有子网的信息保存下来，建立router_id => subnet_id的映射
  portsWithFixedIPs.forEach((type) => {
    type.forEach((port) => {
      const router = routerIdWithExternalNetworkInfo.find((r) => {
        if (shouldHaveExternalGateway && !r.external_gateway_info) {
          return false;
        }
        return r.id === port.device_id;
      });
      if (router && router.id === port.device_id) {
        port.fixed_ips.forEach((item) => {
          canReachSubnetIdsWithRouterId.push({
            subnet_id: item.subnet_id,
            router_id: port.device_id,
          });
        });
      }
    });
  });
  return canReachSubnetIdsWithRouterId;
}

//
// example:
// [
//   [],
//   [],
//   [
//     {
//       "fixed_ips": [
//         {
//           "subnet_id": "7dc1ac8a-656a-4fad-b0ae-55904698224a",
//           "ip_address": "192.168.68.1"
//         }
//       ],
//       "device_id": "0ff37d0e-3c07-4c7f-852d-087c512af5b8"
//     }
//   ]
// ]
/**
 * get all ports with fixed_ips information
 * @returns {Promise<[*, *, *, *, *, *, *, *, *, *]>}
 * @example
 * // returns [
 *        [],
 *        [],
 *        [
 *          {
 *            "fixed_ips": [
 *              {
 *                "subnet_id": "7dc1ac8a-656a-4fad-b0ae-55904698224a",
 *                "ip_address": "192.168.68.1"
 *              }
 *            ],
 *            "device_id": "0ff37d0e-3c07-4c7f-852d-087c512af5b8"
 *          }
 *        ]
 *      ]
 */
export async function getPortsWithFixedIPs() {
  const deviceOwnerList = [
    'network:router_interface_distributed',
    'network:router_interface',
    'network:ha_router_replicated_interface',
  ];
  const portsWithFixedIPs = await Promise.all(
    deviceOwnerList.map((item) =>
      globalPortStore.pureFetchList({
        device_owner: item,
        fields: ['fixed_ips', 'device_id'],
      })
    )
  );
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
    // 保存interface的子网信息
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
  // 获取网络名称
  const networkDetails = await Promise.all(networkPromises);
  networkDetails.forEach((network, index) => {
    ret[index].network_name = network.name;
    // ret[index]['router:external'] = network['router:external'];
  });
  // 提供判断是否为外部网络的网卡
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

  // 提供判断是否已经绑定了浮动ip
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
  // 从路由id获取路由的external_network_id
  const info = routerIdWithExternalNetworkInfo.find(
    (i) => i.id === router.router_id
  );
  if (!info.external_gateway_info) {
    return [];
  }
  const external_network_id = info.external_gateway_info.network_id;
  // 获取所有network_id === 从路由id获取路由的external_network_id的浮动ip
  const fips = await globalFloatingIpsStore.pureFetchList({
    floating_network_id: external_network_id,
    status: 'DOWN',
    project_id: this.currentProjectId,
  });
  // 获取外部网络的名称
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
  const { canReachSubnetIdsWithRouterId } = this.state;
  const item = e.selectedRows[0];
  const totalFips = [];
  // 考虑单subnet连接多个路由，并且路由开启了不同的公网网关。
  // 从interface的子网获取到子网所在路由的id
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
  });
}
