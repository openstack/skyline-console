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
 * List users
 * @param {Object} params request query
 * @param {String} params.domain_id Filters the response by a domain ID.
 * @param {String} params.enabled Filters the response by either enabled (true) or disabled (false) users.
 * @param {String} params.idp_id Filters the response by an identity provider ID.
 * @param {String} params.name Filters the response by a user name.
 * @param {String} params.password_expires_at Filter results based on which user passwords have expired.
 * @param {String} params.protocol_id Filters the response by a protocol ID.
 * @param {String} params.unique_id Filters the response by a unique ID.
 * @returns {Promise}
 */
export const fetchUsers = () =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl('users'),
  });

/**
 * Show user details
 * @param {String} userId The user ID.
 * @returns {Promise}
 */
export const fetchUserDetails = (userId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`users/${userId}`),
  });

/**
 * Create user
 * @param {Object} data request body
 * @param {Object} data.user A user object
 * @param {String} data.user.id id
 * @param {String} data.user.domain_id The ID of the domain of the user, Default value : "default"
 * @param {String} data.user.name The name for the user.
 * @param {String} data.user.email The email for the user.
 * @param {String} data.user.password The password for the user.
 * @param {String} data.user.phone The phone for the user.
 * @param {String} data.user.real_name The true name for the user.
 * @param {Boolean} data.user.enabled Default value : true
 * @param {String} data.user.description The description for the user.
 * @returns {Promise}
 */
export const createUser = (data) =>
  axios.request({
    method: 'post',
    url: getKeystoneBaseUrl('users'),
    data,
  });

/**
 * Update user
 * @param {String} userId The user ID.
 * @param {Object} data request body
 * @param {Object} data.user A user object
 * @param {String} data.user.name The name for the user.
 * @param {String} data.user.email The email for the user.
 * @param {String} data.user.phone The phone for the user.
 * @param {String} data.user.real_name The true name for the user.
 * @param {String} data.user.description The description for the user.
 * @returns {Promise}
 */
export const updateUser = (userId, data) =>
  axios.request({
    method: 'patch',
    url: getKeystoneBaseUrl(`users/${userId}`),
    data,
  });

/**
 * Change password for user
 * @param {String} userId The user ID.
 * @param {Object} data request body
 * @param {Object} data.user A user object
 * @param {String} data.user.original_password The original password for the user.
 * @param {String} data.user.password The new password for the user.
 * @returns {Promise}
 */
export const changeUserPassword = (userId, data) =>
  axios.request({
    method: 'post',
    url: getKeystoneBaseUrl(`users/${userId}/password`),
    data,
  });

/**
 * List projects for user
 * @param {String} userId The user ID.
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchUserProjects = (userId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`users/${userId}/projects`),
  });

/**
 * List groups to which a user belongs
 * @param {String} userId The user ID.
 * @returns {Promise}
 */
export const fetchUserGroups = (userId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`users/${userId}/groups`),
  });
