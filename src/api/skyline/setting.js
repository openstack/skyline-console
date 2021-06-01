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
 * Get a setting item.
 * @param {String} key path
 * @returns {Promise}
 */
export const fetchSetting = (key) =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl(`setting/${key}`),
  });

/**
 * Reset a setting item to default
 * @param {String} key path
 * @returns {Promise}
 */
export const resetSetting = (key) =>
  axios.request({
    method: 'delete',
    url: getSkylineBaseUrl(`setting/${key}`),
  });

/**
 * Update a setting item.
 * @param {Object} data request body
 * @param {String} data.key "string"
 * @param {String} data.value "string"
 * @returns {Promise}
 */
export const updateSetting = (data) =>
  axios.request({
    method: 'put',
    url: getSkylineBaseUrl('setting'),
    data,
  });

/**
 * Get all settings.
 * @returns {Promise}
 */
export const fetchAllSettings = () =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('settings'),
  });
