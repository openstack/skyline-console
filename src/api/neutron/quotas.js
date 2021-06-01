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

import getNeutronBaseUrl from './base';

/**
 * Show quota details for a tenant
 * @param {String} projectId The ID of the project.
 * @returns {Promise}
 */
export const fetchQuotaDetails = (projectId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`quotas/${projectId}/details`),
  });

/**
 * Update quota for a project
 * @param {String} projectId The ID of the project.
 * @param {Object} data request body
 * @param {Object} data.quota A quota object.
 * @param {String} data.quota.floatingip The number of floating IP addresses allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.network The number of networks allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.router The number of routers allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.subnet The number of subnets allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.security_group  The number of security groups allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.security_group_rule  The number of security group rules allowed for each project. A value of -1 means no limit.
 * @param {String} data.quota.firewall_group  A firewall group can have a firewall policy for ingress traffic and/or a firewall policy for egress traffic.
 * @returns {Promise}
 */
export const updateQuotaDetails = (projectId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`quotas/${projectId}`),
    data,
  });
