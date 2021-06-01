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

import getHeatBaseUrl from './base';

/**
 * Create stack
 * @param {Object} tenantId The UUID of the tenant. A tenant is also known as a project.
 * @param {Object} data request body
 * @see https://docs.openstack.org/api-ref/orchestration/v1/index.html?expanded=create-stack-detail#stacks
 * @returns {Promise}
 */
export const createStackOnHeat = (tenantId, data) =>
  axios.request({
    method: 'post',
    url: getHeatBaseUrl(`${tenantId}/stacks`),
    data,
  });

/**
 * Update stack
 * @param {Object} tenantId The UUID of the tenant. A tenant is also known as a project.
 * @param {Object} stackName The name of a stack.
 * @param {Object} stackId The UUID of the stack.
 * @param {Object} data request body
 * @see https://docs.openstack.org/api-ref/orchestration/v1/index.html?expanded=update-stack-detail#stacks
 * @returns {Promise}
 */
export const updateStackOnHeat = (tenantId, stackName, stackId, data) =>
  axios.request({
    method: 'post',
    url: getHeatBaseUrl(`${tenantId}/stacks/${stackName}/${stackId}`),
    data,
  });

/**
 * Delete stack
 * @param {Object} tenantId The UUID of the tenant. A tenant is also known as a project.
 * @param {Object} stackName The name of a stack.
 * @param {Object} stackId The UUID of the stack.
 * @returns {Promise}
 */
export const deleteStackOnHeat = (tenantId, stackName, stackId) =>
  axios.request({
    method: 'delete',
    url: getHeatBaseUrl(`${tenantId}/stacks/${stackName}/${stackId}`),
  });

/**
 * Abandon stack
 * @param {Object} tenantId The UUID of the tenant. A tenant is also known as a project.
 * @param {Object} stackName The name of a stack.
 * @param {Object} stackId The UUID of the stack.
 * @returns {Promise}
 */
export const abandonStackOnHeat = (tenantId, stackName, stackId) =>
  axios.request({
    method: 'delete',
    url: getHeatBaseUrl(`${tenantId}/stacks/${stackName}/${stackId}/abandon`),
  });

/**
 * Get stack template
 * @param {Object} tenantId The UUID of the tenant. A tenant is also known as a project.
 * @param {Object} stackName The name of a stack.
 * @param {Object} stackId The UUID of the stack.
 * @returns {Promise}
 */
export const fetchStackTemplateOnHeat = (tenantId, stackName, stackId) =>
  axios.request({
    method: 'get',
    url: getHeatBaseUrl(`${tenantId}/stacks/${stackName}/${stackId}/template`),
  });
