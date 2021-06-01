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

import getNovaBaseUrl from './base';

/**
 * Create server
 * @param {Object} data request body
 * @param {Object} data.server A server object
 * @param {String} data.server.availability_zone availability_zone
 * @param {Array[Object]} data.server.block_device_mapping_v2 example : [{boot_index:0,delete_on_termination:true,destination_type:"volume",source_type:"image",uuid:"66e129c5-7386-4620-b02a-8e578405e735",volume_size:10,volume_type:"9bcdbe9a-2e06-430f-a6a6-ba77c507cf51"}]
 * @param {String} data.server.flavorRef The flavor reference, as an ID (including a UUID) or full URL, for the flavor for your server instance.
 * @param {String} data.server.imageRef imageRef
 * @param {String} data.server.key_name key_name
 * @param {String} data.server.adminPass admins password
 * @param {Number} data.server.min_count when count > 1
 * @param {Number} data.server.max_count when count > 1
 * @param {String} data.server.return_reservation_id when count > 1
 * @param {String} data.server.name The server name
 * @param {String} data.server.hypervisor_hostname when physicalNodeType.value !== "smart"
 * @param {String} data.server.user_data Configuration information or scripts to use upon launch. Must be Base64 encoded. Restricted to 65535 bytes.
 * @param {Object} data.server["OS-SCH-HNT:scheduler_hints"] example : {group: "xxxxx"}
 * @param {Array[Object]} data.server.networks example : [{uuid: "xxxx"}]
 * @param {Array[Object]} data.server.security_groups example : [{name: "xxxx"}]
 * @returns {Promise}
 */
export const createServer = (data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl('servers'),
    data,
  });

/**
 * Delete server
 * @param {String} id The UUID of the server.
 * @returns {Promise}
 */
export const deleteServer = (id) =>
  axios.request({
    method: 'delete',
    url: getNovaBaseUrl(`servers/${id}`),
  });

/**
 * List Servers
 * @param {Object} params request query
 * @param {String} params.reservation_id A reservation id as returned by a servers multiple create call.
 * @returns {Promise}
 */
export const fetchListServersOnNova = (params) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl('servers'),
    params,
  });

/**
 * Show Server Details
 * @param {String} serverId The UUID of the server.
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchServerDetails = (serverId, params) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`servers/${serverId}`),
    params,
  });

/**
 * Create Console
 * @param {String} serverId The UUID of the server.
 * @param {Object} data request body
 * @param {Object} data.remote_console The remote console object.
 * @param {String} data.remote_console.protocol The protocol of remote console.
 * @param {String} data.remote_console.type The type of remote console.
 * @returns {Promise}
 */
export const createConsoleOnServer = (serverId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`servers/${serverId}/remote-consoles`),
    data,
  });

/**
 * Servers - run an administrative action
 * @param {String} serverId The UUID of the server.
 * @param {Object} data request body
 * @param {String} data.injectNetworkInfo Inject Network Information (injectNetworkInfo Action
 * @param {String} data.migrate The action to cold migrate a server.
 * @returns {Promise}
 */
export const serverActionOnNova = (serverId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`servers/${serverId}/action`),
    data,
  });

/**
 * List Port Interfaces
 * @param {String} serverId The UUID of the server.
 * @returns {Promise}
 */
export const fetchListPortInterfaces = (serverId) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`servers/${serverId}/os-interface`),
  });

/**
 * Create Interface
 * @param {String} serverId The UUID of the server.
 * @param {Object} data request body
 * @param {Object} data.interfaceAttachment Specify the interfaceAttachment action in the request body.
 * @param {Object} data.ip_address The IP address. It is required when fixed_ips is specified.
 * @param {Object} data.port_id The ID of the port for which you want to create an interface.
 * @param {Object} data.net_id The ID of the network for which you want to create a port interface.
 * @param {Object} data.fixed_ips Fixed IP addresses.
 * @param {Object} data.tag A device role tag that can be applied to a network interface when attaching it to the VM.
 * @returns {Promise}
 */
export const createOsInterfaces = (serverId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`servers/${serverId}/os-interface`),
    data,
  });

/**
 * Detach Interface
 * @param {String} serverId The UUID of the server.
 * @param {String} portId The UUID of the port.
 * @returns {Promise}
 */
export const deletePortInterfaces = (serverId, portId) =>
  axios.request({
    method: 'delete',
    url: getNovaBaseUrl(`servers/${serverId}/os-interface/${portId}`),
  });

/**
 * List volume attachments for an instance
 * @param {String} serverId The UUID of the server.
 * @param {Object} params request query
 * @param {Number} params.limit max_limit
 * @param {Number} params.offset offset is where to start in the list
 * @returns {Promise}
 */
export const fetchVolumeAttachments = (serverId, params) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`servers/${serverId}/os-volume_attachments`),
    params,
  });

/**
 * Attach a volume to an instance
 * @param {String} serverId The UUID of the server.
 * @param {Object} data The UUID of the port.
 * @param {Object} data.volumeAttachment A dictionary representation of a volume attachment containing the fields device and volumeId.
 * @param {Object} data.volumeAttachment.volumeId The UUID of the volume to attach.
 * @param {Object} data.volumeAttachment.device Name of the device.
 * @param {Object} data.volumeAttachment.tag A device role tag that can be applied to a volume when attaching it to the VM.
 * @param {Boolean} data.volumeAttachment.delete_on_termination To delete the attached volume when the server is destroyed.
 * @returns {Promise}
 */
export const attachVolumeOnInstance = (serverId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`servers/${serverId}/os-volume_attachments}`),
    data,
  });

/**
 * Detach a volume from an instance
 * @param {String} serverId The UUID of the server.
 * @param {Object} volumeId The UUID of the volume to detach.
 * @returns {Promise}
 */
export const deleteVolumeOnInstance = (serverId, volumeId) =>
  axios.request({
    method: 'delete',
    url: getNovaBaseUrl(
      `servers/${serverId}/os-volume_attachments/${volumeId}}`
    ),
  });
