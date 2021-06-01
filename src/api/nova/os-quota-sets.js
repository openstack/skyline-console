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

import getNovaBaseUrl from './base';

/**
 * Show The Detail of Quota
 * @returns {Promise}
 */
export const fetchOsQuotaSetsDetails = (tenantId) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`os-quota-sets/${tenantId}/detail`),
  });

/**
 * Update Quotas
 * @param {String} tenantId The UUID of the tenant in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.quota_set A quota object.
 * @param {String} data.quota_set.instances The number of allowed servers for each tenant.
 * @param {String} data.quota_set.cores The number of allowed server cores for each tenant.
 * @param {String} data.quota_set.ram The amount of allowed server RAM, in MiB, for each tenant.
 * @param {String} data.quota_set.server_groups The number of allowed server groups for each tenant.
 * @returns {Promise}
 */
export const updateQuotaSets = (tenantId, data) =>
  axios.request({
    method: 'put',
    url: getNovaBaseUrl(`os-quota-sets/${tenantId}`),
    data,
  });
