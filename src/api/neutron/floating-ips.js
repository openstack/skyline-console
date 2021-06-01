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
 * Update floating IP
 * @param {String} floatingipId The ID of the floating IP address.
 * @param {Object} data request body
 * @param {Object} data.floatingip A floatingip object.
 * @param {String} data.floatingip.port_id The ID of a port associated with the floating IP.
 * @param {String} data.floatingip.fixed_ip_address The fixed IP address that is associated with the floating IP.
 * @param {String} data.floatingip.description A human-readable description for the resource. Default is an empty string.
 * @returns {Promise}
 */
export const updateFloatingIp = (floatingipId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`floatingips/${floatingipId}`),
    data,
  });

/**
 * List floating IPs
 * @param {String} floatingipId The ID of the floating IP address.
 * @param {Object} query request query
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-floating-ips-detail#floating-ips-floatingips
 * @returns {Promise}
 */
export const fetchListFloatingIps = (floatingipId, params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`floatingips/${floatingipId}`),
    params,
  });

/**
 * List floating IP port forwardings
 * @param {String} floatingipId The ID of the floating IP address.
 * @param {Object} query request query
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-floating-ips-detail,list-floating-ip-port-forwardings-detail#floating-ips-floatingips
 * @returns {Promise}
 */
export const fetchListPortForwardings = (floatingipId, params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`floatingips/${floatingipId}`),
    params,
  });

/**
 * Create port forwarding
 * @param {String} floatingipId The ID of the floating IP address.
 * @param {Object} data request body
 * @param {Object} data.port_forwarding A floating IP port forwarding object.
 * @returns {Promise}
 */
export const createPortForwarding = (floatingipId, data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl(`floatingips/${floatingipId}/port_forwardings`),
    data,
  });

/**
 * Delete a floating IP port forwarding
 * @param {String} floatingipId The ID of the floating IP address.
 * @param {String} portForwardingId The ID of the floating IP port forwarding.
 */
export const deletePortForwarding = (floatingipId, portForwardingId) =>
  axios.request({
    method: 'delete',
    url: getNeutronBaseUrl(
      `floatingips/${floatingipId}/port_forwardings/${{ portForwardingId }}`
    ),
  });
