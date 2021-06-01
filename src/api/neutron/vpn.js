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
 * Update IKE policy
 * @param {String} ikepolicyId The ID of the IKE policy.
 * @param {Object} data request body
 * @param {Object} data.ikepolicy An ikepolicy object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=update-ike-policy-detail#vpnaas-2-0-vpn-vpnservices-ikepolicies-ipsecpolicies-endpoint-groups-ipsec-site-connections
 * @returns {Promise}
 */
export const updateIkePolicyOnNeutron = (ikepolicyId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`vpn/ikepolicies/${ikepolicyId}`),
    data,
  });

/**
 * Update IPsec connection
 * @param {String} connectionId The ID of the IPsec site-to-site connection.
 * @param {Object} data request body
 * @param {Object} data.ipsec_site_connection An ipsec_site_connection object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=update-ipsec-connection-detail#vpnaas-2-0-vpn-vpnservices-ikepolicies-ipsecpolicies-endpoint-groups-ipsec-site-connections
 * @returns {Promise}
 */
export const updateIpConnectionOnNeutron = (connectionId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`vpn/ipsec-site-connections/${connectionId}`),
    data,
  });

/**
 * Show IPsec connection
 * @param {String} connectionId The ID of the IPsec site-to-site connection.
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchIpConnectionDetailsOnNeutron = (connectionId, params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`vpn/ipsec-site-connections/${connectionId}`),
    params,
  });

/**
 * Update VPN endpoint group
 * @param {String} endpointGroupId The ID of the VPN endpoint group.
 * @param {Object} data request body
 * @param {Object} data.endpoint_group An ipsec_site_connection object.
 * @param {Object} data.endpoint_group.name Human-readable name of the resource. Default is an empty string.
 * @param {Object} data.endpoint_group.description A human-readable description for the resource. Default is an empty string.
 * @returns {Promise}
 */
export const updateEndpointGroupOnNeutron = (endpointGroupId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`vpn/endpoint-groups/${endpointGroupId}`),
    data,
  });

/**
 * Update VPN service
 * @param {String} serviceId The ID of the VPN service.
 * @param {Object} data request body
 * @param {Object} data.vpnservice A vpnservice object.
 * @param {Object} data.vpnservice.name Human-readable name of the resource. Default is an empty string.
 * @param {Object} data.vpnservice.description A human-readable description for the resource. Default is an empty string.
 * @param {Boolean} data.vpnservice.admin_state_up The administrative state of the resource, which is up (true) or down (false).
 * @returns {Promise}
 */
export const updateVpnServiceNeutron = (serviceId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`vpn/vpnservices/${serviceId}`),
    data,
  });

/**
 * Update IPsec policy
 * @param {String} ipsecpolicyId The ID of the IPsec policy.
 * @param {Object} data request body
 * @param {Object} data.ipsecpolicy An ipsecpolicy object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=update-ipsec-policy-detail#vpnaas-2-0-vpn-vpnservices-ikepolicies-ipsecpolicies-endpoint-groups-ipsec-site-connections
 * @returns {Promise}
 */
export const updateIpsecPolicyOnNeutron = (ipsecpolicyId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`vpn/ipsecpolicies/${ipsecpolicyId}`),
    data,
  });
