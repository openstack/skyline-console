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
 * List accessible snapshots
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} params request body
 * @param {String} params.all_tenants Shows details for all project. Admin only.
 * @param {String} params.sort A valid direction is asc (ascending) or desc (descending).
 * @param {String} params.limit Default value : 10
 * @param {String} params.offset Used in conjunction with limit to return a slice of items.
 * @param {String} params.marker The ID of the last-seen item.
 * @param {String} params.with_count Whether to show count in API response or not, default is False.
 * @returns {Promise}
 */
export const fetchListAccessibleSnapshots = (projectId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/snapshots`),
    params,
  });

/**
 * Show a snapshot’s details
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} snapshotId The UUID of the snapshot.
 * @returns {Promise}
 */
export const fetchListAccessibleSnapshotDetails = (projectId, snapshotId) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/snapshots/${snapshotId}`),
  });

/**
 * Update a snapshot
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} snapshotId The UUID of the snapshot.
 * @param {Object} data request body
 * @returns {Promise}
 */
export const updateSnapshotOnCinder = (projectId, snapshotId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/snapshots/${snapshotId}`),
    data,
  });
