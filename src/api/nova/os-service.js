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
 * List Compute Services
 * @param {Object} params request query
 * @param {String} params.binary Filter the service list result by binary name of the service. example : nova-compute
 * @param {String} params.host Filter the service list result by the host name.
 * @returns {Promise}
 */
export const fetchOsServices = (params) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl('os-services'),
    params,
  });

/**
 * Update Compute Service
 * @param {String} serviceId The id of the service as a uuid.
 * @param {Object} data request body
 * @param {String} data.status The status of the service. One of enabled or disabled.
 * @param {String} data.disabled_reason The reason for disabling a service.
 * @param {Boolean} data.forced_down forced_down is a manual override to tell nova that the service in question has been fenced manually by the operations team.
 * @returns {Promise}
 */
export const updateComputeService = (serviceId, data) =>
  axios.request({
    method: 'put',
    url: getNovaBaseUrl(`os-services/${serviceId}`),
    data,
  });
