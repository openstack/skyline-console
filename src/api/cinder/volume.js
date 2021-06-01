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
 * Show a volume’s details
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} volumeId The UUID of the volume.
 * @returns {Promise}
 */
export const fetchAccessibleVolumeDetails = (projectId, volumeId) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/volumes/${volumeId}`),
  });

/**
 * Volume actions
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} volumeId The UUID of the volume.
 * @param {Object} data request body
 * @see https://docs.openstack.org/api-ref/block-storage/v3/index.html?expanded=id356-detail#volume-transfers-volume-transfers-3-55-or-later
 * @returns {Promise}
 */
export const volumeActionsOnCinder = (projectId, volumeId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/volumes/${volumeId}/action`),
    data,
  });

/**
 * Update a volume
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} volumeId The UUID of the volume.
 * @param {Object} data request body
 * @param {Object} data.volume A volume object.
 * @param {String} data.volume.description The volume description.
 * @param {String} data.volume.name The volume name.
 * @param {Object} data.volume.metadata One or more metadata key and value pairs that are associated with the volume.
 * @returns {Promise}
 */
export const updateVolumeOnCinder = (projectId, volumeId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/volumes/${volumeId}/action`),
    data,
  });
