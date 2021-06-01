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
 * Create Node
 * @param {Object} data request body
 * @param {String} data.console_interface The boot interface for a Node, e.g. “pxe”.
 * @param {String} data.conductor_group The conductor group for a node.
 * @param {String} data.console_interface The console interface for a node, e.g. “no-console”.
 * @param {String} data.deploy_interface The deploy interface for a node, e.g. “iscsi”.
 * @param {String} data.driver_info All the metadata required by the driver to manage this Node.
 * @param {String} data.driver The name of the driver used to manage this Node.
 * @param {String} data.extra A set of one or more arbitrary metadata key and value pairs.
 * @param {String} data.inspect_interface The interface used for node inspection, e.g. “no-inspect”.
 * @param {String} data.management_interface Interface for out-of-band node management, e.g. “ipmitool”.
 * @param {String} data.name Human-readable identifier for the Node resource. May be undefined. Certain words are reserved.
 * @param {String} data.network_interface Which Network Interface provider to use when plumbing the network connections for this Node.
 * @param {String} data.power_interface Interface used for performing power actions on the node, e.g. “ipmitool”.
 * @param {String} data.properties Physical characteristics of this Node.
 * @param {String} data.raid_interface Interface used for configuring RAID on this node, e.g. “no-raid”.
 * @param {String} data.rescue_interface The interface used for node rescue, e.g. “no-rescue”.
 * @param {String} data.resource_class A string which can be used by external schedulers to identify this Node as a unit of a specific type of resource.
 * @param {String} data.storage_interface Interface used for attaching and detaching volumes on this node, e.g. “cinder”.
 * @see https://docs.openstack.org/api-ref/baremetal/?expanded=create-node-detail
 * @returns {Promise}
 */
export const createNodeOnIronic = (data) =>
  axios.request({
    method: 'post',
    url: getIronicBaseUrl('nodes'),
    data,
  });

/**
 * Update Node
 * @param {String} nodeIdent The UUID or Name of the node.
 * @see https://docs.openstack.org/api-ref/baremetal/?expanded=update-node-detail
 * @returns {Promise}
 */
export const updateNodeOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'patch',
    url: getIronicBaseUrl(`nodes/${nodeIdent}`),
    data,
  });

/**
 * Node State Summary
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const fetchNodeStateSummaryOnIronic = (nodeIdent) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/states`),
  });

/**
 * Validate Node
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const fetchNodeValidateOnIronic = (nodeIdent) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/validate`),
  });

/**
 * List Ports by Node
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const fetchNodePortsOnIronic = (nodeIdent) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/ports`),
  });

/**
 * Change Node Provision State
 * @param {String} nodeIdent The UUID or Name of the node.
 * @param {Object} data request body
 * @param {String} data.target The requested provisioning state of this Node.
 * @param {String | Object} data.configdrive A config drive to be written to a partition on the Node’s boot disk.
 * @param {Array} data.clean_steps An ordered list of cleaning steps that will be performed on the node.
 * @param {Array} data.deploy_steps A list of deploy steps that will be performed on the node.
 * @param {String} data.rescue_password Non-empty password used to configure rescue ramdisk during node rescue operation.
 * @param {Boolean} data.disable_ramdisk If set to true, the ironic-python-agent ramdisk will not be booted for cleaning.
 * @returns {Promise}
 */
export const changeNodeProvisionStateOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'put',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/states/provision`),
    data,
  });

/**
 * Change Node Power State
 * @param {String} nodeIdent The UUID or Name of the node.
 * @param {Object} data request body
 * @param {String} data.target Avaliable value : “power on”, “power off”, “rebooting”, “soft power off” or “soft rebooting”.
 * @param {Number} data.timeout Timeout (in seconds) for a power state transition.
 * @returns {Promise}
 */
export const changeNodePowerStateOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'put',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/states/power`),
    data,
  });

/**
 * Set Maintenance Flag
 * @param {String} nodeIdent The UUID or Name of the node.
 * @param {Object} data request body
 * @param {String} data.reason Specify the reason for setting the Node into maintenance mode.
 * @returns {Promise}
 */
export const setMaintenanceFlagOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'put',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/maintenance`),
    data,
  });

/**
 * Clear Maintenance Flag
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const deleteMaintenanceFlagOnIronic = (nodeIdent) =>
  axios.request({
    method: 'delete',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/maintenance`),
  });

/**
 * Get Boot Device
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const fetchBootDeviceOnIronic = (nodeIdent) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/management/boot_device`),
  });

/**
 * Set Boot Device
 * @param {String} nodeIdent The UUID or Name of the node.
 * @param {Object} data request body
 * @param {String} data.boot_device The boot device for a Node, eg. “pxe” or “disk”.
 * @param {String} data.persistent Whether the boot device should be set only for the next reboot, or persistently.
 * @returns {Promise}
 */
export const setBootDeviceOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'put',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/management/boot_device`),
    data,
  });

/**
 * Get Supported Boot Devices
 * @param {String} nodeIdent The UUID or Name of the node.
 * @returns {Promise}
 */
export const fetchBootDeviceSupportedOnIronic = (nodeIdent) =>
  axios.request({
    method: 'get',
    url: getIronicBaseUrl(
      `nodes/${nodeIdent}/management/boot_device/supported`
    ),
  });

/**
 * Set all traits of a node
 * @param {String} nodeIdent The UUID or Name of the node.
 * @param {Object} data request body
 * @param {Object} data.traits List of traits for this node.
 * @returns {Promise}
 */
export const setAllTraitsOnIronic = (nodeIdent, data) =>
  axios.request({
    method: 'put',
    url: getIronicBaseUrl(`nodes/${nodeIdent}/traits`),
    data,
  });
