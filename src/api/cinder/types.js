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

import cinderBase from './base';

/**
 * Show all extra specifications for volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchExtraSpecsForTypes = (projectId, volumeTypeId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/extra_specs`),
    params,
  });

/**
 * Create or update extra specs for volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {Object} body request body
 * @param {Object} body.extra_specs A set of key and value pairs that contains the specifications for a volume type.
 * @returns {Promise}
 */
export const createExtraSpecsForTypes = (projectId, volumeTypeId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/extra_specs`),
    data,
  });

/**
 * Delete extra specification for volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {String} keyName The key name of the extra spec for a volume type.
 * @returns {Promise}
 */
export const deleteExtraSpecsForTypes = (projectId, volumeTypeId, keyName) =>
  axios.request({
    method: 'delete',
    url: cinderBase(
      `${projectId}/types/${volumeTypeId}/extra_specs/${keyName}`
    ),
  });

/**
 * Create volume type for v2
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.volume_type A volume_type object.
 * @param {String} data.volume_type.name The name of the Volume Transfer.
 * @param {String} data.volume_type.description The backup description or null.
 * @param {Boolean} data.volume_type.is_public Volume type which is accessible to the public.
 * @param {Object} data.volume_type.extra_specs A set of key and value pairs that contains the specifications for a volume type.
 * @param {String} data.volume_type.extra_specs.capabilities example : "gpu"
 * @returns {Promise}
 */
export const createVolumeType = (projectId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/types`),
    data,
  });

/**
 * Update volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {Object} data request body
 * @param {Object} data.volume_type A volume_type object.
 * @param {String} data.volume_type.name The name of the Volume Transfer.
 * @param {String} data.volume_type.description The backup description or null.
 * @param {Boolean} data.volume_type.is_public Volume type which is accessible to the public.
 * @param {Object} data.volume_type.extra_specs A set of key and value pairs that contains the specifications for a volume type.
 * @param {String} data.volume_type.extra_specs.capabilities example : "gpu"
 * @returns {Promise}
 */
export const updateVolumeType = (projectId, volumeTypeId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/types/${volumeTypeId}`),
    data,
  });

/**
 * Show an encryption type for v2
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @returns {Promise}
 */
export const fetchVolumeTypesEncryption = (projectId, volumeTypeId) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/encryption`),
  });

/**
 * Create an encryption type for v2
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {Object} data request body
 * @param {Object} data.encryption The encryption information.
 * @param {String} data.encryption.key_size Size of encryption key, in bits. For example, 128 or 256. The default value is None.
 * @param {String} data.encryption.provider The class that provides encryption support.
 * @param {Boolean} data.encryption.control_location The default value is “front-end”.
 * @param {Object} data.encryption.cipher The encryption algorithm or mode. For example, aes-xts-plain64. The default value is None.
 * @returns {Promise}
 */
export const createVolumeTypesEncryption = (projectId, volumeTypeId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/encryption`),
    data,
  });

/**
 * Delete an encryption type for v2
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The UUID for an existing volume type.
 * @param {String} encryptionId The ID of the encryption type.
 * @returns {Promise}
 */
export const deleteVolumeTypesEncryption = (
  projectId,
  volumeTypeId,
  encryptionId
) =>
  axios.request({
    method: 'delete',
    url: cinderBase(
      `${projectId}/types/${volumeTypeId}/encryption/${encryptionId}`
    ),
  });

/**
 * Add private volume type access
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The ID of Volume Type to be accessed by project.
 * @param {Object} data request body
 * @param {Object} data.addProjectAccess A addProjectAccess object. When add request
 * @param {String} data.addProjectAccess.project The ID of the project. When add request
 * @param {Object} data.removeProjectAccess A removeProjectAccess project. When delete request
 * @param {String} data.removeProjectAccess.project The ID of the project. When delete request
 * @returns {Promise}
 */
export const addOrDeleteVolumeTypeAccess = (projectId, volumeTypeId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/action`),
    data,
  });

/**
 * List private volume type access details
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeTypeId The ID of Volume Type to be accessed by project.
 * @returns {Promise}
 */
export const fetchVolumeTypesAccessDetails = (projectId, volumeTypeId) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/types/${volumeTypeId}/os-volume-type-access`),
  });
