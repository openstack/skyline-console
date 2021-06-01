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
 * List subnets
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchListSubnetsOnNeutron = (params) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl('subnets'),
    params,
  });

/**
 * Show subnet details
 * @param {String} subnetId The ID of the subnet.
 * @returns {Promise}
 */
export const fetchSubnetDetailsOnNeutron = (subnetId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`subnets/${subnetId}`),
  });

/**
 * Create subnet
 * @param {Object} data request body
 * @param {Object} data.subnet A subnet object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-dhcp-agents-hosting-a-network-detail,show-subnet-details-detail,list-routers-detail,create-subnet-detail#id5
 * @returns {Promise}
 */
export const createSubnetOnNeutron = (data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl('subnets'),
    data,
  });

/**
 * Update subnet
 * @param {String} subnetId The ID of the subnet.
 * @param {Object} data request body
 * @param {Object} data.subnet A subnet object.
 * @see https://docs.openstack.org/api-ref/network/v2/index.html?expanded=list-ports-detail,update-subnet-detail#ports
 * @returns {Promise}
 */
export const updateSubnetOnNeutron = (subnetId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`subnets/${subnetId}`),
    data,
  });
