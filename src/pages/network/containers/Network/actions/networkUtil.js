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

import _, { isString } from 'lodash';
import { ipValidate } from 'utils/validate';

const { ipFull, isIpCidr, isIPv6Cidr, isIPv4, isIpv6, compareIpv6 } =
  ipValidate;

const physicalNetworkArray = ['vlan', 'flat'];

const segmentationNetworkArray = ['vxlan', 'vlan', 'gre'];

const segmentationNetworkRequireArray = ['vlan', 'gre'];

const checkAllocation_pools = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(
            t(
              'Invalid: Allocation Pools Format Error(e.g. 192.168.1.2,192.168.1.200) and start ip should be less than end ip'
            )
          )
        );
  }
  return Promise.resolve(true);
  function hasError(line) {
    const pool = line.split(',');
    if (pool.length !== 2) {
      return true;
    }
    const startIp = pool[0];
    const endIp = pool[1];
    return (
      ipFull(startIp) > ipFull(endIp) || !isIPv4(startIp) || !isIPv4(endIp)
    );
  }
};

const checkIpv6Allocation_pools = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(
            t(
              'Invalid: Allocation Pools Format Error(e.g. fd00:dead:beef:58::9,fd00:dead:beef:58::13) and start ip should be less than end ip'
            )
          )
        );
  }
  return Promise.resolve(true);

  function hasError(line) {
    const pool = line.split(',');
    if (pool.length !== 2) {
      return true;
    }
    const startIp = pool[0];
    const endIp = pool[1];
    return (
      compareIpv6(startIp, endIp) > 0 || !isIpv6(startIp) || !isIpv6(endIp)
    );
  }
};

const checkDNS = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(t('Invalid: DNS Format Error(e.g. 114.114.114.114)'))
        );
  }
  return Promise.resolve(true);
  function hasError(line) {
    return !isIPv4(line);
  }
};

const checkIpv6DNS = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(t('Invalid: DNS Format Error(e.g. 1001:1001::)'))
        );
  }
  return Promise.resolve(true);
  function hasError(line) {
    return !isIpv6(line);
  }
};

const checkHostRoutes = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(
            t('Host Routes Format Error(e.g. 192.168.200.0/24,10.56.1.254)')
          )
        );
  }
  return Promise.resolve(true);
  function hasError(line) {
    const [destination, nexthop] = line.trim().split(',');
    return !isIpCidr(destination) && !nexthop;
  }
};

const checkIpv6HostRoutes = (rule, value) => {
  if (value && _.isString(value)) {
    const lines = value.trim().split(/\s*[\r\n]+\s*/g);
    const flag = !lines.some(hasError);
    return flag
      ? Promise.resolve(true)
      : Promise.reject(
          new Error(
            t('Host Routes Format Error(e.g. ::0a38:01fe/24,::0a38:01fe)')
          )
        );
  }
  return Promise.resolve(true);
  function hasError(line) {
    const [destination, nexthop] = line.trim().split(',');
    return !isIPv6Cidr(destination) && !nexthop;
  }
};

const getAllocationPools = (allocation_pools) => {
  const allocationPools = [];
  if (allocation_pools && _.isString(allocation_pools)) {
    const lines = allocation_pools.trim().split(/\s*[\r\n]+\s*/g);
    lines.forEach((item) => {
      const [start, end] = item.split(',');
      allocationPools.push({
        start,
        end,
      });
    });
  }
  return allocationPools;
};

const getHostRouters = (host_routes) => {
  const hostRouters = [];
  if (host_routes && _.isString(host_routes)) {
    const lines = host_routes.trim().split(/\s*[\r\n]+\s*/g);
    lines.forEach((item) => {
      const [destination, nexthop] = item.split(',');
      hostRouters.push({
        destination,
        nexthop,
      });
    });
  }
  return hostRouters;
};

const getAllocationPoolsIntoLines = (allocation_pools) => {
  if (allocation_pools.length === 0) {
    return undefined;
  }
  return allocation_pools
    .reduce((pre, cur) => `${pre}${cur.start},${cur.end}\n`, '')
    .trim();
};

const getDNSIntoLines = (dns_nameservers) => {
  if (dns_nameservers.length === 0) {
    return undefined;
  }
  return dns_nameservers.reduce((pre, cur) => `${pre}${cur}\n`, '').trim();
};

const splitToArray = (value) => {
  if (isString(value) && value) {
    return value.trim().split(/\s*[\r\n]+\s*/g);
  }
  return [];
};

const getHostRoutesIntoLines = (host_routes) => {
  if (host_routes.length === 0) {
    return undefined;
  }
  return host_routes
    .reduce((pre, cur) => `${pre}${cur.destination},${cur.nexthop}\n`, '')
    .trim();
};

export default {
  physicalNetworkArray,
  segmentationNetworkArray,
  segmentationNetworkRequireArray,
  checkAllocation_pools,
  checkIpv6Allocation_pools,
  checkDNS,
  checkIpv6DNS,
  checkHostRoutes,
  checkIpv6HostRoutes,
  getAllocationPools,
  getHostRouters,
  getAllocationPoolsIntoLines,
  getDNSIntoLines,
  splitToArray,
  getHostRoutesIntoLines,
};
