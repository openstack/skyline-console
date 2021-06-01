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
 * Show quota usage for a project
 * @param {String} adminProjectId The UUID of the administrative project.
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} params request query
 * @param {Boolean} params.usage Default : false
 * @returns {Promise}
 */
export const fetchQuotaUsageOnProject = (adminProjectId, projectId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${adminProjectId}/os-quota-sets/${projectId}`),
    params,
  });

/**
 * Update quotas for a project
 * @param {String} adminProjectId The UUID of the tenant in a multi-tenancy cloud.
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.quota_set A quota object.
 * @param {String} data.quota_set.volumes The number of volumes that are allowed for each project.
 * @param {Number} data.quota_set.gigabytes The size (GB) of volumes and snapshots that are allowed for each project.
 * @param {Number} data.quota_set.backup_gigabytes The size (GB) of backups that are allowed for each project.
 * @param {Number} data.quota_set.snapshots The number of snapshots that are allowed for each project.
 * @param {Number} data.quota_set.backups The number of backups that are allowed for each project.
 * @returns {Promise}
 */
export const updateCinderQuotaSets = (adminProjectId, projectId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${adminProjectId}/os-quota-sets/${projectId}`),
    data,
  });
