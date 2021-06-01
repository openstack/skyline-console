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

import getSkylineBaseUrl from './base';

/**
 * List policies
 * @returns {Promise}
 */
export const fetchPolicies = () =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('policies'),
  });

/**
 * Check policies
 * @param {Object} data request body
 * @param {Array[String]} data.rules ["string"]
 * @returns {Promise}
 */
export const checkPolicies = (data) =>
  axios.request({
    method: 'post',
    url: getSkylineBaseUrl('policies/check'),
    data,
  });
