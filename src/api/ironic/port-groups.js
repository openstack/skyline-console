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
 * Create Portgroup
 * @param {Object} data request body
 * @param {String} data.node_uuid UUID of the Node this resource belongs to.
 * @param {String} data.address Physical hardware address of this network Port.
 * @param {String} data.name Human-readable identifier for the Portgroup resource. May be undefined.
 * @param {Object} data.mode Mode of the port group.
 * @param {Boolean} data.standalone_ports_supported Indicates whether ports that are members of this portgroup can be used as stand-alone ports.
 * @param {String} data.properties Key/value properties related to the port group’s configuration.
 * @param {String} data.extra A set of one or more arbitrary metadata key and value pairs.
 * @param {String} data.uuid The UUID for the resource.
 * @see https://docs.openstack.org/api-ref/baremetal/?expanded=set-all-traits-of-a-node-detail,create-portgroup-detail
 */
export const createPortGroupOnIronic = (data) =>
  axios.request({
    method: 'post',
    url: getIronicBaseUrl('portgroups'),
    data,
  });

/**
 * Update a Port
 * @param {String} portId The UUID of the port.
 * @param {Object} data request body
 * @see https://docs.openstack.org/api-ref/baremetal/?expanded=set-all-traits-of-a-node-detail,update-a-portgroup-detail
 * @returns {Promise}
 */
export const updatePortGroupOnIronic = (portgroupIdent, data) =>
  axios.request({
    method: 'patch',
    url: getIronicBaseUrl(`portgroups/${portgroupIdent}`),
    data,
  });
