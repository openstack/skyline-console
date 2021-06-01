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

import getOctaviaBaseUrl from './base';

/**
 * Update a Load Balancer
 * @param {String} loadbalancerId The ID of the load balancer to query.
 * @param {Object} data request body
 * @param {Object} data.loadbalancer A load balancer object.
 * @param {Boolean} data.loadbalancer.admin_state_up The administrative state of the resource, which is up (true) or down (false).
 * @param {String} data.loadbalancer.name Human-readable name of the resource.
 * @param {Array} data.loadbalancer.tags A list of simple strings assigned to the resource.
 * @param {String} data.loadbalancer.vip_qos_policy_id The ID of the QoS Policy which will apply to the Virtual IP (VIP).
 * @returns {Promise}
 */
export const updateLoadBalancer = (loadbalancerId, data) =>
  axios.request({
    method: 'put',
    url: getOctaviaBaseUrl(`lbaas/loadbalancers/${loadbalancerId}`),
    data,
  });

/**
 * List Load Balancers
 * @param {Object} params request query
 * @param {String} params.project_id The ID of the project to query.
 * @param {String} params.fields A load balancer object.
 * @returns {Promise}
 */
export const fetchListLoadBalancers = (params) =>
  axios.request({
    method: 'get',
    url: getOctaviaBaseUrl('lbaas/loadbalancers'),
    params,
  });

/**
 * Show Load Balancer details
 * @param {String} loadbalancerId The ID of the load balancer to query.
 * @param {Object} params request query
 * @param {String} params.fields A load balancer object.
 * @returns {Promise}
 */
export const fetchLoadBalancerDetails = (loadbalancerId, params) =>
  axios.request({
    method: 'get',
    url: getOctaviaBaseUrl(`lbaas/loadbalancers/${loadbalancerId}`),
    params,
  });

/**
 * Remove a Load Balancer
 * @param {String} loadbalancerId The ID of the load balancer to query.
 * @param {Object} params request query
 * @param {Boolean} params.cascade If true will delete all child objects of the load balancer.
 * @returns {Promise}
 */
export const deleteLoadBalancer = (loadbalancerId, params) =>
  axios.request({
    method: 'delete',
    url: getOctaviaBaseUrl(`lbaas/loadbalancers/${loadbalancerId}`),
    params,
  });

/**
 * Create Member
 * @param {String} poolId The ID of the pool to query.
 * @param {Object} data request body
 * @param {Object} data.member The member object.
 * @returns {Promise}
 */
export const createMemberOnOctavia = (poolId, data) =>
  axios.request({
    method: 'post',
    url: getOctaviaBaseUrl(`lbaas/pools/${poolId}/members`),
    data,
  });

/**
 * Batch Update Members
 * @param {String} poolId The ID of the pool to query.
 * @param {Object} data request body
 * @param {Object} data.members The members object.
 * @returns {Promise}
 */
export const batchUpdateMembersOnOctavia = (poolId, data) =>
  axios.request({
    method: 'put',
    url: getOctaviaBaseUrl(`lbaas/pools/${poolId}/members`),
    data,
  });

/**
 * Update A Member
 * @param {String} poolId The ID of the pool to query.
 * @param {String} memberId The ID of the member to query.
 * @param {Object} data request body
 * @param {Object} data.member The member object.
 * @returns {Promise}
 */
export const updateAMemberOnOctavia = (poolId, memberId, data) =>
  axios.request({
    method: 'put',
    url: getOctaviaBaseUrl(`lbaas/pools/${poolId}/members/${memberId}`),
    data,
  });

/**
 * Delete A Member
 * @param {String} poolId The ID of the pool to query.
 * @param {String} memberId The ID of the member to query.
 * @returns {Promise}
 */
export const deleteAMemberOnOctavia = (poolId, memberId) =>
  axios.request({
    method: 'delete',
    url: getOctaviaBaseUrl(`lbaas/pools/${poolId}/members/${memberId}`),
  });
