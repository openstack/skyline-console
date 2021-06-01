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

import getSkylineBaseUrl from './base';

/**
 * List Servers.
 * Notes:
 * The host of sort_keys is only used for admin/system_admin role users.
 * The name is to support for fuzzy queries.
 * @param {Object} params request query
 * @param {Number} params.limit Default value : 10
 * @param {String} params.marker marker
 * @param {String} params.sort_dirs Available values : desc, asc
 * @param {Array[String]} params.sort_keys Available values : uuid, display_name, vm_state, locked, created_at, host, project_id
 * @param {Boolean} params.all_projects Default value : false
 * @param {String} params.project_id Only works when the all_projects filter is also specified.
 * @param {String} params.project_name Only works when the all_projects filter is also specified.
 * @param {String} params.name name
 * @param {String} params.floating_ip Floating IP of server.
 * @param {String} params.fixed_ip Fixed IP of server.
 * @param {String} params.status Available values : ACTIVE, BUILD, ERROR, HARD_REBOOT, MIGRATING, PAUSED, REBOOT, REBUILD, RESCUE, RESIZE, SHELVED, SHELVED_OFFLOADED, SHUTOFF, SOFT_DELETED, SUSPENDED, UNKNOWN
 * @param {String} params.host It will be ignored for non-admin user.
 * @param {String} params.flavor_id flavors id
 * @param {Array[String]} params.uuid UUID of server.
 * @returns {Promise}
 */
export const fetchListServers = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/servers'),
    params,
  });

/**
 * List Recycle Servers.
 * Notes:
 * The updated_at of sort_keys is used as deleted_at.
 * The name is to support for fuzzy queries.
 * @param {Object} params request query
 * @param {Number} params.limit Default value : 10
 * @param {String} params.marker marker
 * @param {String} params.sort_dirs Available values : desc, asc
 * @param {Array[String]} params.sort_keys Available values : uuid, display_name, updated_at, project_id
 * @param {Boolean} params.all_projects Default value : false
 * @param {String} params.project_id Only works when the all_projects filter is also specified.
 * @param {String} params.project_name Only works when the all_projects filter is also specified.
 * @param {String} params.name name
 * @param {String} params.floating_ip Floating IP of server.
 * @param {String} params.fixed_ip Fixed IP of server.
 * @param {Array[String]} params.uuid UUID of server.
 * @returns {Promise}
 */
export const fetchListRecycleServers = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/recycle_servers'),
    params,
  });

/**
 * List Volumes.
 * @param {Object} params request query
 * @param {Number} params.limit Default value : 10
 * @param {String} params.marker marker
 * @param {String} params.sort_dirs Available values : desc, asc
 * @param {Array[String]} params.sort_keys Available values : id, name, size, status, bootable, created_at
 * @param {Boolean} params.all_projects Default value : false
 * @param {String} params.project_id Only works when the all_projects filter is also specified.
 * @param {String} params.name name
 * @param {Boolean} params.multiattach Default value : false
 * @param {String} params.status Available values : creating, available, reserved, attaching, detaching, in-use, maintenance, deleting, awaiting-transfer, error, error_deleting, backing-up, restoring-backup, error_backing-up, error_restoring, error_extending, downloading, uploading, retyping, extending
 * @param {Boolean} params.bootable Default value : false
 * @param {Array[String]} params.uuid UUID of volume.
 * @returns {Promise}
 */
export const fetchListVolumes = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/volumes'),
    params,
  });

/**
 * List Volume Snapshots.
 * @param {Object} params request query
 * @param {Number} params.limit Default value : 10
 * @param {String} params.marker marker
 * @param {String} params.sort_dirs Available values : desc, asc
 * @param {Array[String]} params.sort_keys Available values : id, name, status, created_at
 * @param {Boolean} params.all_projects Default value : false
 * @param {String} params.project_id Only works when the all_projects filter is also specified.
 * @param {String} params.name name
 * @param {String} params.status Available values : CREATING, AVAILABLE, DELETING, ERROR, ERROR_DELETING
 * @param {String} params.volume_id volumes id
 * @returns {Promise}
 */
export const fetchListVolumeSnapshots = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/volume_snapshots'),
    params,
  });

/**
 * List Ports.
 * @param {Object} params request query
 * @param {Number} params.limit Default value : 10
 * @param {String} params.marker marker
 * @param {String} params.sort_dirs Available values : desc, asc
 * @param {Array[String]} params.sort_keys Available values : id, name, mac_address, status, project_id
 * @param {Boolean} params.all_projects Default value : false
 * @param {String} params.project_id Only works when the all_projects filter is also specified.
 * @param {String} params.name name
 * @param {String} params.status Available values : ACTIVE, DOWN, BUILD, ERROR, N/A
 * @param {String} params.network_name networks name
 * @param {String} params.network_id networks id
 * @param {String} params.device_id devices id
 * @param {Array[String]} params.device_owner Available values : , compute:nova, network:dhcp, network:floatingip, network:router_gateway, network:router_ha_interface, network:ha_router_replicated_interface
 * @param {Array[String]} params.uuid UUID of port.
 * @returns {Promise}
 */
export const fetchListPorts = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/ports'),
    params,
  });

/**
 * List compute services.
 * @param {Object} params request query
 * @param {String} params.binary binary
 * @param {String} params.host host
 * @returns {Promise}
 */
export const fetchListComputeServices = (params) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('extension/compute-services'),
    params,
  });
