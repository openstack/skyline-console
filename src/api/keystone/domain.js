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
 * List domains
 * @returns {Promise}
 */
export const fetchDomains = () =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl('domains'),
  });

/**
 * Show domain details
 * @param {String} domainId The domain ID.
 * @returns {Promise}
 */
export const fetchDomainDetails = (domainId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`domains/${domainId}`),
  });

/**
 * Update domain
 * @param {String} domainId The domain ID.
 * @param {Object} data request body
 * @param {Object} data request body
 * @returns {Promise}
 */
export const updateDomain = (domainId, data) =>
  axios.request({
    method: 'patch',
    url: getKeystoneBaseUrl(`domains/${domainId}`),
    data,
  });

/**
 * List role assignments for user on domain
 * @param {String} domainId The domain ID.
 * @param {String} userId The user ID.
 * @returns {Promise}
 */
export const fetchRolesOnDomain = (domainId, userId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`domains/${domainId}/users/${userId}/roles`),
  });

/**
 * Assign role to user on domain
 * @param {String} domainId The domain ID.
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const updateRoleOnDomain = (domainId, userId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(
      `domains/${domainId}/users/${userId}/roles/${roleId}`
    ),
  });

/**
 * Unassigns role from user on domain
 * @param {String} domainId The domain ID.
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const deleteRoleOnDomain = (domainId, userId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(
      `domains/${domainId}/users/${userId}/roles/${roleId}`
    ),
  });

/**
 * List role assignments for group on domain
 * @param {String} domainId The domain ID.
 * @param {String} groupId The group ID.
 * @returns {Promise}
 */
export const fetchRolesForGroupOnDomain = (domainId, groupId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`domains/${domainId}/groups/${groupId}/roles`),
  });

/**
 * Assign role to group on domain
 * @param {String} domainId The domain ID.
 * @param {String} groupId The group ID.
 * @returns {Promise}
 */
export const assignRoleForGroupOnDomain = (domainId, groupId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(
      `domains/${domainId}/groups/${groupId}/roles/${roleId}`
    ),
  });

/**
 * Assign role to group on domain
 * @param {String} domainId The domain ID.
 * @param {String} groupId The group ID.
 * @returns {Promise}
 */
export const unassignRoleForGroupOnDomain = (domainId, groupId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(
      `domains/${domainId}/groups/${groupId}/roles/${roleId}`
    ),
  });
