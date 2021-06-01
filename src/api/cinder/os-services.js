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
 * Cinder Service change
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {String} actionName Actions name Avaliable Values : disable,disable-log-reason,enable,get-log,set-log,freeze,thaw,failover_host
 * @param {Object} data request body
 * @param {String} data.host The name of the host, when actionName is disable
 * @param {String} data.binary The binary name of the service, when actionName is disable
 * @param {String} data.disabled_reason The reason for disabling a service.
 * @param {String} data.server The name of the host.
 * @param {String} data.prefix The prefix for the log path we are querying, for example cinder. or sqlalchemy.engine
 * @param {String} data.levels The log level to set, case insensitive, accepted values are INFO, WARNING, ERROR and DEBUG.
 * @param {String} data.backend_id ID of backend to failover to. Default is None.
 * @param {String} data.cluster The cluster name. Only in cinder-volume service.New in version 3.7
 * @returns {Promise}
 */
export const toggleChangeCinderOsService = (projectId, actionName, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`${projectId}/os-services/${actionName}`),
    data,
  });

/**
 * List All Cinder Services
 * @param {String} projectId The UUID of the project in a multi-tenancy cloud.
 * @param {Object} params request query
 * @param {String} params.binary Filter the service list result by binary name of the service.
 * @param {String} params.host Filter the service list result by host name of the service.
 * @returns {Promise}
 */
export const fetchListCinderServices = (projectId, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`${projectId}/os-services`),
    params,
  });
