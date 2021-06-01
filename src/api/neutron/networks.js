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

import axios from '@/libs/axios';

import getNeutronBaseUrl from './base';

/**
 * List networks
 * @param {Object} params request query
 * @param {Boolean} params.admin_state_up Filter the list result by the administrative state of the resource, which is up (true) or down (false).
 * @param {Number} params.mtu Filter the network list result by the maximum transmission unit (MTU) value to address fragmentation. Minimum value is 68 for IPv4, and 1280 for IPv6.
 * @param {String} params.name Filter the list result by the human-readable name of the resource.
 * @param {String} params.project_id Filter the list result by the ID of the project that owns the resource.
 * @param {String} params['provider:network_type'] Filter the list result by the type of physical network that this network/segment is mapped to.
 * @param {String} params['provider:physical_network'] Filter the list result by the physical network where this network/segment is implemented.
 * @param {String} params['provider:segmentation_id'] Filter the list result by the ID of the isolated segment on the physical network.
 * @param {String} params.revision_number Filter the list result by the revision number of the resource.
 * @param {Boolean} params.shared Filter the network list result based on if the network is shared across all tenants.
 * @param {String} params.status Filter the network list result by network status. Values are ACTIVE, DOWN, BUILD or ERROR.
 * @returns {Promise}
 */
export const fetchNetworksOnNeutron = (params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('networks'),
    params,
  });

/**
 * List DHCP agents hosting a network
 * @param {String} networkId The ID of the attached network.
 * @returns {Promise}
 */
export const fetchListDhcpAgentsOnNeutron = (networkId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`networks/${networkId}/dhcp-agents`),
  });

/**
 * Show network details
 * @param {String} networkId The ID of the attached network.
 * @returns {Promise}
 */
export const fetchNetworkDetailsOnNeutron = (networkId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`networks/${networkId}`),
  });

/**
 * Show Network IP Availability
 * @param {String} networkId The ID of the attached network.
 * @returns {Promise}
 */
export const fetchNetworkIpAvailabilityDetailsOnNeutron = (networkId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`network-ip-availabilities/${networkId}`),
  });
