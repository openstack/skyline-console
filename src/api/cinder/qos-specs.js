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

import cinderBase from './base';

/**
 * Create a QoS specification
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} data request body
 * @param {Object} data.qos_specs A qos_specs object.
 * @param {String} data.qos_specs.name The name of the QoS specification.
 * @returns {Promise}
 */
export const createQosSpecOnCinder = (projectId, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`${projectId}/qos-specs`),
    data,
  });

/**
 * Set keys in a QoS specification
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} qosId The ID of the QoS specification.
 * @param {Object} data request body
 * @param {Object} data.qos_specs A qos_specs object.
 * @returns {Promise}
 */
export const updateQosSpecOnCinder = (projectId, qosId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/qos-specs/${qosId}`),
    data,
  });

/**
 * Unset keys in a QoS specification
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} qosId The ID of the QoS specification.
 * @param {Object} data request body
 * @param {Array} data.keys List of Keys.
 * @returns {Promise}
 */
export const deleteKeysInQosSpecOnCinder = (projectId, qosId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/qos-specs/${qosId}`),
    data,
  });

/**
 * Associate QoS specification with a volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} qosId The ID of the QoS specification.
 * @param {Object} params request query
 * @param {Object} params.vol_type_id A volume type ID.
 * @returns {Promise}
 */
export const fetchAssociateQosSpecOnCinder = (projectId, qosId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/qos-specs/${qosId}/associate`),
    params,
  });

/**
 * Disassociate QoS specification from a volume type
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} qosId The ID of the QoS specification.
 * @param {Object} params request query
 * @param {Object} params.vol_type_id A volume type ID.
 * @returns {Promise}
 */
export const fetchDisassociateQosSpecOnCinder = (projectId, qosId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/qos-specs/${qosId}/associate`),
    params,
  });

/**
 * Show a QoS specification details
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} qosId The ID of the QoS specification.
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchQosSpecDetailsOnCinder = (projectId, qosId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/qos-specs/${qosId}`),
    params,
  });
