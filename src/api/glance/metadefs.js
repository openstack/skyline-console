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
 * Get namespace details
 * @param {String} namespaceName The name of the namespace whose details you want to see.
 * @param {Object} params request query
 * @param {String} params.resource_type Apply the prefix for the specified resource type to the names of the properties listed in the response.
 * @returns {Promise}
 */
export const fetchNamespaceDetailsOnGlance = (namespaceName, params) =>
  axios.request({
    method: 'get',
    url: cinderBase(`metadefs/namespaces/${namespaceName}`),
    params,
  });

/**
 * Update namespace
 * @param {String} namespaceName The name of the namespace whose details you want to see.
 * @param {Object} data request body
 * @param {String} data.description The description of the namespace.
 * @param {String} data.display_name User-friendly name to use in a UI to display the namespace name.
 * @param {String} data.namespace An identifier (a name) for the namespace.
 * @param {Boolean} data.protected Namespace protection for deletion. A valid value is true or false. Default is false.
 * @param {String} data.visibility The namespace visibility. A valid value is public or private. Default is private.
 * @returns {Promise}
 */
export const updateNamespaceOnGlance = (namespaceName, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`metadefs/namespaces/${namespaceName}`),
    data,
  });

/**
 * Create namespace
 * @param {Object} data request body
 * @param {String} data.description The description of the namespace.
 * @param {String} data.display_name User-friendly name to use in a UI to display the namespace name.
 * @param {String} data.namespace An identifier (a name) for the namespace.
 * @param {Boolean} data.protected Namespace protection for deletion. A valid value is true or false. Default is false.
 * @param {String} data.visibility The namespace visibility. A valid value is public or private. Default is private.
 * @returns {Promise}
 */
export const createNamespaceOnGlance = (data) =>
  axios.request({
    method: 'post',
    url: cinderBase('metadefs/namespaces'),
    data,
  });

/**
 * List resource types
 * @returns {Promise}
 */
export const fetchListResourceTypesOnGlance = () =>
  axios.request({
    method: 'get',
    url: cinderBase('metadefs/resource_types'),
  });

/**
 * Remove resource type association
 * @param {String} namespaceName The name of the namespace whose details you want to see.
 * @param {String} resourceTypeName The name of the resource type.
 * @returns {Promise}
 */
export const deleteResourceTypeOnGlance = (namespaceName, resourceTypeName) =>
  axios.request({
    method: 'delete',
    url: cinderBase(
      `metadefs/namespaces/${namespaceName}/resource_types/${resourceTypeName}`
    ),
  });

/**
 * Create resource type association
 * @param {String} namespaceName The name of the namespace whose details you want to see.
 * @param {Object} data request body
 * @param {String} data.name Name of the resource type. A Name is limited to 80 chars in length.
 * @param {String} data.prefix Prefix for any properties in the namespace that you want to apply to the resource type.
 * @param {String} data.properties_target Some resource types allow more than one key and value pair for each instance.
 * @returns {Promise}
 */
export const createResourceTypeOnGlance = (namespaceName, data) =>
  axios.request({
    method: 'post',
    url: cinderBase(`metadefs/namespaces/${namespaceName}/resource_types`),
    data,
  });
