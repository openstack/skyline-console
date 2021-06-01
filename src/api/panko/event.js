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

import getPankoBaseUrl from './base';

/**
 * List events
 * @param {Object} params request query
 * @param {String} params['q.field'] 'filter_self'
 * @param {String} params['q.op'] 'le'
 * @param {Boolean} params['q.value'] true or false
 * @param {String} params.sort 'generated:desc'
 * @param {Number} params.limit 10
 * @param {String} params.mariker "string"
 * @returns {Promise}
 */
export const fetchEvents = (params) =>
  axios.request({
    method: 'get',
    url: getPankoBaseUrl('events'),
    params,
  });

/**
 * Fetch count for event
 * @param {Object} params request query
 * @param {String} params['q.field'] 'filter_self'
 * @param {String} params['q.op'] 'le'
 * @param {Boolean} params['q.value'] true or false
 * @returns {Promise}
 */
export const fetchEventCount = (params) =>
  axios.request({
    method: 'get',
    url: getPankoBaseUrl('events/count'),
    params,
  });
