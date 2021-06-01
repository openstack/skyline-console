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
 * login
 * @param {Object} data request body
 * @param {String} data.region RegionOne
 * @param {String} data.domain default
 * @param {String} data.username admin
 * @param {String} data.password password
 * @returns {Promise}
 */
export const login = (data) =>
  axios.request({
    method: 'post',
    url: getSkylineBaseUrl('login'),
    data,
  });

/**
 * logout
 * @returns {Promise}
 */
export const logout = () =>
  axios.request({
    method: 'post',
    url: getSkylineBaseUrl('logout'),
  });

/**
 * fetch profile
 * @returns {Promise}
 */
export const fetchProfile = () =>
  axios.request({
    method: 'get',
    url: getSkylineBaseUrl('profile'),
  });

/**
 * switch_project
 * @param {String} projectId projects id
 * @returns {Promise}
 */
export const switchProject = (projectId) =>
  axios.request({
    method: 'post',
    url: getSkylineBaseUrl(`switch_project/${projectId}`),
  });
