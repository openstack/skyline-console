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

import getIronicBaseUrl from './base';

/**
 * List Detailed Ports
 * @param {Object} params request query
 * @param {String} params.node Filter the list of returned Ports.
 */
export const fetchDetailedPortsOnIronic = (params) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl('ports'),
    params,
  });

/**
 * Create Port
 * @param {Object} data request body
 * @param {String} data.node_uuid UUID of the Node this resource belongs to.
 * @param {String} data.address Physical hardware address of this network Port.
 * @param {String} data.portgroup_uuid UUID of the Portgroup this resource belongs to.
 * @param {Object} data.local_link_connection The Port binding profile.
 * @param {Boolean} data.pxe_enabled Indicates whether PXE is enabled or disabled on the Port.
 * @param {String} data.physical_network The name of the physical network to which a port is connected. May be empty.
 * @param {String} data.extra A set of one or more arbitrary metadata key and value pairs.
 * @param {Boolean} data.is_smartnicIndicates whether the Port is a Smart NIC port.
 * @param {String} data.uuid The UUID for the resource.
 */
export const createPortsOnIronic = (data) =>
  axios.request({
    method: 'post',
    url: getIronicBaseUrl('ports'),
    data,
  });

/**
 * Update a Port
 * @param {String} portId The UUID of the port.
 * @param {Object} data request body
 * @see https://docs.openstack.org/api-ref/baremetal/?expanded=set-all-traits-of-a-node-detail,update-a-port-detail
 * @returns {Promise}
 */
export const updatePortsOnIronic = (portId, data) =>
  axios.request({
    method: 'patch',
    url: getIronicBaseUrl(`ports/${portId}`),
    data,
  });
