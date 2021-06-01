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
 * List ports
 * @param {Object} params request query
 * @param {String} params.device_id Filter the port list result by the ID of the device that uses this port.
 * @param {String} params.device_owner Filter the port result list by the entity type that uses this port.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-ports-detail#ports
 */
export const fetchPortsOnNeutron = (params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('ports'),
    params,
  });

/**
 * Update port
 * @param {String} portId The ID of the port.
 * @param {Object} data request body
 * @param {String} data.port A port object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=update-port-detail#ports
 */
export const updatePortOnNeutron = (portId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`ports/${portId}`),
    data,
  });

/**
 * Create port
 * @param {Object} data request body
 * @param {String} data.port A port object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=create-port-detail#ports
 */
export const createPortOnNeutron = (data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl('ports'),
    data,
  });
