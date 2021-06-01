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
 * Create a restore on backup
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} backupId The UUID of the backupchains.
 * @param {Object} data request body
 * @param {Object} data.restore The restore object.
 * @returns {Promise}
 */
export const createBackupRestoreOnCinder = (projectId, backupId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/backups/${backupId}/restore`),
    data,
  });

/**
 * Create a restore on backup chain
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} backupId The UUID of the backupchains.
 * @param {Object} data request body
 * @param {Object} data.restore The restore object.
 * @returns {Promise}
 */
export const createBackupChainRestoreOnCinder = (projectId, backupId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/backup_chains/${backupId}/restore`),
    data,
  });
