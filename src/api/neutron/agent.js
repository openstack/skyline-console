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
 * List agents
 * @returns {Promise}
 */
export const fetchAgents = () =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('agents'),
  });

/**
 * Schedule a network to a DHCP agent
 * @param {String} agentId The ID of the agent.
 * @param {Object} data request body
 * @param {String} data.network_id The ID of the network.
 * @returns {Promise}
 */
export const addNetworkToDhcpAgent = (agentId, data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl(`agents/${agentId}/dhcp-networks`),
    data,
  });

/**
 * Remove network from a DHCP agent
 * @param {String} agentId The ID of the agent.
 * @param {String} networkId The ID of the network.
 * @returns {Promise}
 */
export const deleteNetworkToDhcpAgent = (agentId, networkId) =>
  axios.request({
    method: 'delete',
    url: getNeutronBaseUrl(`agents/${agentId}/dhcp-networks/${networkId}`),
  });

/**
 * Schedule router to an l3 agent
 * @param {String} agentId The ID of the agent.
 * @param {Object} data request body
 * @param {String} data.router_id The ID of the router.
 * @returns {Promise}
 */
export const addRoterToL3Agent = (agentId, data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl(`agents/${agentId}/l3-routers`),
    data,
  });

/**
 * Remove l3 router from an l3 agent
 * @param {String} agentId The ID of the agent.
 * @param {String} routerId The ID of the router.
 * @returns {Promise}
 */
export const deleteL3RouterFromL3Agent = (agentId, routerId) =>
  axios.request({
    method: 'delete',
    url: getNeutronBaseUrl(`agents/${agentId}/l3-routers/${routerId}`),
  });
