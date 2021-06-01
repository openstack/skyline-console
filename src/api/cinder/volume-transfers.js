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
 * Create a volume transfer
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.transfer The volume transfer object.
 * @param {String} data.transfer.name The name of the object.
 * @param {String} data.transfer.volume_id The UUID of the volume.
 * @param {Boolean} data.transfer.no_snapshots Transfer volume without snapshots. Defaults to False if not specified.
 * @returns {Promise}
 */
export const createVolumenTransfer = (projectId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/volume-transfers`),
    data,
  });

/**
 * List volume transfers for a project
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} params request query
 * @param {Object} params.all_tenants Shows details for all project. Admin only.
 * @param {String} params.limit Requests a page size of items. Returns a number of items up to a limit value.
 * @param {String} params.offset Used in conjunction with limit to return a slice of items. offset is where to start in the list.
 * @param {Boolean} params.marker The ID of the last-seen item.
 * @param {Boolean} params.sort_key Sorts by an attribute. Default is created_at.
 * @param {Boolean} params.sort_dir Sorts by one or more sets of attribute and sort direction combinations.
 * @returns {Promise}
 */
export const fetchVolumenTransfersForProject = (projectId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/volume-transfers`),
    params,
  });

/**
 * Delete a volume transfer
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} transferId The unique identifier for a volume transfer.
 * @returns {Promise}
 */
export const deleteVolumenTransfer = (projectId, transferId) =>
  axios.request({
    method: 'delete',
    url: cinderBase(`${projectId}/volume-transfers/${transferId}`),
  });

/**
 * Accept a volume transfer
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.accept The accept object.
 * @param {String} data.accept.auth_key The name of the object.
 * @returns {Promise}
 */
export const acceptVolumenTransfer = (projectId, transferId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/volume-transfers/${transferId}/accept`),
    data,
  });
