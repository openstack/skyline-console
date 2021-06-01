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
 * Add Host, Remove Host, Create Or Update Aggregate Metadata
 * @param {Object} data request body
 * @param {Object} data.add_host when add host
 * @param {Object} data.remove_host when remove host
 * @param {Object} data.set_metadata when set metadata
 * @returns {Promise}
 */
export const toggleChangeAggregate = (aggregateId, data) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`os-aggregates/${aggregateId}/action`),
    data,
  });
