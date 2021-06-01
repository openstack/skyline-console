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
 * List all availability zones
 * @param {Object} params request query
 * @param {String} params.state Filter the list result by the state of the availability zone, which is either available or unavailable.
 * @param {String} params.resource Filter the list result by the resource type of the availability zone.
 * @param {String} params.name Filter the list result by the human-readable name of the resource.
 * @returns {Promise}
 */
export const fetchListAvailabilityZonesOnNeutron = (params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('availability_zones'),
    params,
  });
