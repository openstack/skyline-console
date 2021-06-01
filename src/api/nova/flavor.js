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
 * List Flavor Access Information For Given Flavor
 * @param {String} flavorId The ID of the flavor.
 * @returns {Promise}
 */
export const fetchFlavorAccessinfomation = (flavorId) =>
  axios.request({
    method: 'get',
    url: getNovaBaseUrl(`flavors/${flavorId}/os-flavor-access`),
  });

/**
 * Create Flavor
 * @param {Object} data request body
 * @param {Object} data.flavor A flavor is a combination of memory, disk size, and CPUs.
 * @param {String} data.flavor.name The display name of a flavor.
 * @param {String} data.flavor.description A free form description of the flavor.
 * @param {String} data.flavor.id The ID of the flavor.
 * @param {Number} data.flavor.ram The amount of RAM a flavor has, in MiB.
 * @param {Number} data.flavor.disk The size of the root disk that will be created in GiB.
 * @param {Number} data.flavor.vcpus The number of virtual CPUs that will be allocated to the server.
 * @param {Number} data.flavor.swap The size of a dedicated swap disk that will be allocated, in MiB.
 * @param {Number} data.flavor['OS-FLV-EXT-DATA:ephemeral'] The size of the ephemeral disk that will be created, in GiB.
 * @param {Number} data.flavor.rxtx_factor The receive / transmit factor (as a float) that will be set on ports if the network backend supports the QOS extension.
 * @param {Boolean} data.flavor.['os-flavor-access:is_public'] Whether the flavor is public
 * @returns {Promise}
 */
export const createFlavor = (data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl('flavors'),
    data,
  });

/**
 * Add Or Remove Flavor Access To Tenant
 * @param {String} flavorId The ID of the flavor.
 * @param {Object} data request body
 * @param {Object} data.addTenantAccess The action.
 * @param {String} data.addTenantAccess.tenant The UUID of the tenant in a multi-tenancy cloud.
 * @param {String} data.removeTenantAccess The action.
 * @param {String} data.removeTenantAccess.tenant The UUID of the tenant in a multi-tenancy cloud.
 * @returns {Promise}
 */
export const addOrDeleteFlavorAccessToTenant = (flavorId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`flavors/${flavorId}/action`),
    data,
  });

/**
 * Create Extra Specs For A Flavor
 * @param {String} flavorId The ID of the flavor.
 * @param {Object} data request body
 * @param {Object} data.extra_specs A dictionary of the flavor’s extra-specs key-and-value pairs.
 * @param {String} data.extra_specs.key The extra spec key of a flavor.
 * @param {String} data.extra_specs.value The extra spec value of a flavor.
 * @returns {Promise}
 */
export const createExtraSpecsForFlavor = (flavorId, data) =>
  axios.request({
    method: 'post',
    url: getNovaBaseUrl(`flavors/${flavorId}/os-extra_specs`),
    data,
  });

/**
 * Update An Extra Spec For A Flavor
 * @param {String} flavorId The ID of the flavor.
 * @param {Object} flavorExtraSpecKey The extra spec key for the flavor.
 * @param {Object} data request body
 * @param {String} data.key The extra spec key of a flavor.
 * @param {String} data.value The extra spec value of a flavor.
 * @returns {Promise}
 */
export const updateExtraSpecsForFlavor = (flavorId, flavorExtraSpecKey, data) =>
  axios.request({
    method: 'put',
    url: getNovaBaseUrl(
      `flavors/${flavorId}/os-extra_specs/${flavorExtraSpecKey}`
    ),
    data,
  });

/**
 * Delete An Extra Spec For A Flavor
 * @param {String} flavorId The ID of the flavor.
 * @param {Object} flavorExtraSpecKey The extra spec key for the flavor.
 * @returns {Promise}
 */
export const deleteExtraSpecsForFlavor = (flavorId, flavorExtraSpecKey) =>
  axios.request({
    method: 'delete',
    url: getNovaBaseUrl(
      `flavors/${flavorId}/os-extra_specs/${flavorExtraSpecKey}`
    ),
  });
