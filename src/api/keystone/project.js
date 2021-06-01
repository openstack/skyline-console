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
 * List projects
 * @returns {Promise}
 */
export const fetchProjects = () =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl('projects'),
  });

/**
 * Show project details
 * @param {String} projectId path
 * @returns {Promise}
 */
export const fetchProject = (projectId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`projects/${projectId}`),
  });

/**
 * Create project
 * @param {Object} data request body
 * @param {Object} data.project A project object
 * @param {String} data.project.name The name of the project, which must be unique within the owning domain
 * @param {Boolean} data.project.domain_id The ID of the domain for the project.
 * @param {String} data.project.description The description of the project.
 * @param {Boolean} data.project.enabled If set to true, project is enabled. If set to false, project is disabled.
 * @returns {Promise}
 */
export const createProject = (data) =>
  axios.request({
    method: 'post',
    url: getKeystoneBaseUrl('projects}'),
    data,
  });

/**
 * Update project
 * @param {String} projectId The project ID.
 * @param {Object} data request body
 * @param {Object} data.project A project object
 * @param {String} data.project.name The name of the project
 * @param {String} data.project.description The description of the project.
 * @param {Boolean} data.project.enabled If set to true, project is enabled. If set to false, project is disabled.
 * @returns {Promise}
 */
export const updateProject = (projectId, data) =>
  axios.request({
    method: 'patch',
    url: getKeystoneBaseUrl(`projects/${projectId}`),
    data,
  });

/**
 * List role assignments for user on project
 * @param {String} projectId projects id
 * @param {String} userId users id
 * @returns {Promise}
 */
export const fetchRolesOnProject = (projectId, userId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`projects/${projectId}/users/${userId}/roles`),
  });

/**
 * List role assignments for group on project
 * @param {String} projectId projects id
 * @param {String} groupId groups id
 * @returns {Promise}
 */
export const fetchRolesForGroupOnProject = (projectId, groupId) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`projects/${projectId}/groups/${groupId}/roles`),
  });

/**
 * Modify tag list for a project
 * @param {String} projectId The project ID.
 * @param {Object} data request body
 * @param {Array[String]} data.tags example : ["foo", "bar"]
 * @returns {Promise}
 */
export const updateTagsOnProject = (projectId, data) =>
  axios.request({
    method: 'get',
    url: getKeystoneBaseUrl(`projects/${projectId}/tags`),
    data,
  });

/**
 * Assign role to group on project
 * @param {String} projectId The project ID.
 * @param {String} groupId The group ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const assignRoleToGroupOnProject = (projectId, groupId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(
      `projects/${projectId}/groups/${groupId}/roles/${roleId}`
    ),
  });

/**
 * Assign role to group on project
 * @param {String} projectId The project ID.
 * @param {String} groupId The group ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const unassignRoleToGroupOnProject = (projectId, groupId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(
      `projects/${projectId}/groups/${groupId}/roles/${roleId}`
    ),
  });

/**
 * Assign role to user on project
 * @param {String} projectId The project ID.
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const assignRoleToUserOnProject = (projectId, userId, roleId) =>
  axios.request({
    method: 'put',
    url: getKeystoneBaseUrl(
      `projects/${projectId}/users/${userId}/roles/${roleId}`
    ),
  });

/**
 * Unassign role from user on project
 * @param {String} projectId The project ID.
 * @param {String} userId The user ID.
 * @param {String} roleId The role ID.
 * @returns {Promise}
 */
export const unassignRoleToUserOnProject = (projectId, userId, roleId) =>
  axios.request({
    method: 'delete',
    url: getKeystoneBaseUrl(
      `projects/${projectId}/users/${userId}/roles/${roleId}`
    ),
  });
