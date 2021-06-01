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
 * List routers
 * @param {Object} params request query
 * @param {String} params.project_id Filter the list result by the ID of the project that owns the resource.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-dhcp-agents-hosting-a-network-detail,show-subnet-details-detail,list-routers-detail#id5
 * @returns {Promise}
 */
export const fetchListRoutersOnNeutron = (params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('routers'),
    params,
  });

/**
 * Show router details
 * @param {String} routerId The ID of the router.
 * @returns {Promise}
 */
export const fetchRouterDetailsOnNeutron = (routerId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`routers/${routerId}`),
  });

/**
 * Add extra routes to router
 * @param {String} routerId The ID of the router.
 * @param {Object} data request body
 * @param {Object} data.router The router object.
 * @param {Array} data.router.routes The extra routes configuration for L3 router.
 * @returns {Promise}
 */
export const addExtraRoutesToRouterOnNeutron = (routerId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`routers/${routerId}/add_extraroutes`),
    data,
  });

/**
 * Remove extra routes from router
 * @param {String} routerId The ID of the router.
 * @param {Object} data request body
 * @param {Object} data.router The router object.
 * @param {Array} data.router.routes The extra routes configuration for L3 router.
 * @returns {Promise}
 */
export const removeExtraRoutesFromRouterOnNeutron = (routerId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`routers/${routerId}/remove_extraroutes`),
    data,
  });

/**
 * Add interface to router
 * @param {String} routerId The ID of the router.
 * @param {Object} data request body
 * @param {Object} data.subnet_id The ID of the subnet. One of subnet_id or port_id must be specified.
 * @param {Array} data.port_id The ID of the port. One of subnet_id or port_id must be specified.
 * @returns {Promise}
 */
export const addInterfaceToRouterOnNeutron = (routerId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`routers/${routerId}/add_router_interface`),
    data,
  });

/**
 * Remove interface from router
 * @param {String} routerId The ID of the router.
 * @param {Object} data request body
 * @param {Object} data.subnet_id The ID of the subnet. One of subnet_id or port_id must be specified.
 * @param {Array} data.port_id The ID of the port. One of subnet_id or port_id must be specified.
 * @returns {Promise}
 */
export const removeInterfaceFromRouterOnNeutron = (routerId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`routers/${routerId}/remove_router_interface`),
    data,
  });
