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
 * Assign a system role to a user
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const updateSystemRole = (userId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(`system/users/${userId}/roles/${roleId}`),
  });

/**
 * Delete a system role assignment from a user
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const deleteSystemRole = (userId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(`system/users/${userId}/roles/${roleId}`),
  });

/**
 * List system role assignments for a group
 * @param {String} groupId The group ID.
 * @returns {Promise}
 */
export const fetchSystemRolesForGroup = (groupId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`system/groups/${groupId}/roles`),
  });

/**
 * Assign a system role to a group
 * @param {String} groupId The group ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const assignSystemRoleForGroup = (groupId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(`system/groups/${groupId}/roles/${roleId}`),
  });

/**
 * Assign a system role to a group
 * @param {String} groupId The group ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const unassignSystemRoleForGroup = (groupId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(`system/groups/${groupId}/roles/${roleId}`),
  });
