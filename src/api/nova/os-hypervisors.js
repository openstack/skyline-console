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
 * List Hypervisors Details
 * @returns {Promise}
 */
export const fetchOsHypervisorsDetails = () =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl('os-hypervisors/detail'),
  });

/**
 * Show Hypervisor Details
 * @param {String} hypervisorId path
 * @returns {Promise}
 */
export const fetchOsHypervisorDetails = (hypervisorId) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`os-hypervisors/${hypervisorId}`),
  });
