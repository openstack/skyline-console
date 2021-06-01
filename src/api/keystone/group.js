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

import getKeystoneBaseUrl from './base';

/**
 * List groups
 * @param {String} groupId path
 * @param {Object} parmas request query
 * @param {String} parmas.name Filters the response by a group name.
 * @param {String} parmas.domain_id Filters the response by a domain ID.
 * @returns {Promise}
 */
export const fetchGroups = (parmas) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl('groups'),
    parmas,
  });

/**
 * Show group details
 * @param {String} groupId path
 * @returns {Promise}
 */
export const fetchGroupDetails = (groupId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`groups/${groupId}`),
  });

/**
 * List users in group
 * @param {String} groupId path
 * @param {Object} parmas request query
 * @param {String} parmas.password_expires_at Filter results based on which user passwords have expired.
 * @returns {Promise}
 */
export const fetchGroupUsers = (groupId, parmas) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`groups/${groupId}/users`),
    parmas,
  });

/**
 * Remove user from group
 * @param {String} groupId The group ID.
 * @param {String} userId The user ID.
 * @returns {Promise}
 */
export const deleteGroupUsers = (groupId, userId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(`groups/${groupId}/users/${userId}`),
  });

/**
 * Add user to group
 * @param {String} groupId The group ID.
 * @param {String} userId The user ID.
 * @returns {Promise}
 */
export const addGroupUsers = (groupId, userId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(`groups/${groupId}/users/${userId}`),
  });

/**
 * Create group
 * @param {Object} data request body
 * @param {Object} data.group request body
 * @param {Object} data.group.description The description of the group.
 * @param {Object} data.group.domain_id The ID of the domain of the group.
 * @param {Object} data.group.name The name of the group.
 * @returns {Promise}
 */
export const createGroup = (groupId, data) =>
  axios.request({
    method: 'post',
    url: getKeystoneBaseUrl('groups'),
    data,
  });

/**
 * Update group
 * @param {Object} data request body
 * @param {Object} data.group request body
 * @param {Object} data.group.description The description of the group.
 * @param {Object} data.group.domain_id The ID of the domain of the group.
 * @param {Object} data.group.name The name of the group.
 * @returns {Promise}
 */
export const updateGroup = (groupId, data) =>
  axios.request({
    method: 'patch',
    url: getKeystoneBaseUrl(`groups/${groupId}`),
    data,
  });
