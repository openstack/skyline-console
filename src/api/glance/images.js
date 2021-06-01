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
 * Create image
 * @param {Object} data request body
 * @param {String} data.container_format Format of the image container.
 * @param {String} data.disk_format The format of the disk.
 * @param {String} data.id A unique, user-defined image UUID, in the format: nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn
 * @param {Number} data.min_disk Amount of disk space in GB that is required to boot the image.
 * @param {Number} data.min_ram Amount of RAM in MB that is required to boot the image.
 * @param {String} data.name The name of the image.
 * @param {Boolean} data.protected Image protection for deletion.
 * @param {Array} data.tags List of tags for this image.
 * @param {String} data.visibility Visibility for this image. Valid value is one of: public, private, shared, or community.
 * @returns {Promise}
 */
export const createImage = (data) =>
  axios.request({
    method: 'post',
    url: cinderBase('images'),
    data,
  });

/**
 * Update image
 * @param {String} imageId The UUID of the image.
 * @param {Object} data request body
 * @param {String} data.container_format Format of the image container.
 * @param {String} data.disk_format The format of the disk.
 * @param {String} data.id A unique, user-defined image UUID, in the format: nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn
 * @param {Number} data.min_disk Amount of disk space in GB that is required to boot the image.
 * @param {Number} data.min_ram Amount of RAM in MB that is required to boot the image.
 * @param {String} data.name The name of the image.
 * @param {Boolean} data.protected Image protection for deletion.
 * @param {Array} data.tags List of tags for this image.
 * @param {String} data.visibility Visibility for this image. Valid value is one of: public, private, shared, or community.
 * @returns {Promise}
 */
export const updateImage = (imageId, data) =>
  axios.request({
    method: 'patch',
    url: cinderBase(`images/${imageId}`),
    headers: {
      'content-type': 'application/openstack-images-v2.1-json-patch',
    },
    data,
  });

/**
 * Upload binary image data
 * Set the Content-Type request header to application/octet-stream.
 * @param {String} imageId The UUID of the image.
 * @param {File} data Image file
 * @returns {Promise}
 */
export const uploadBinaryImageData = (imageId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`images/${imageId}/file`),
    headers: {
      'content-type': 'application/octet-stream',
    },
    data,
  });

/**
 * List images
 * @param {Object} params request query
 * @param {Number} params.limit Requests a page size of items
 * @param {String} params.disk_format Example : "iso"
 * @param {String} params.marker The ID of the last-seen item.
 * @param {String} params.name Filters the response by a name.
 * @param {String} params.owner Filters the response by a project (also called a “tenant”) ID.
 * @param {Boolean} params.protected Filters the response by the ‘protected’ image property.
 * @param {Number} params.status Filters the response by an image status.
 * @param {Number} params.tag Filters the response by the specified tag value.
 * @param {String} params.visibility Filters the response by an image visibility value.
 * @param {Boolean} params.os_hidden When true, filters the response to display only “hidden” images.
 * @param {String} params.member_status Filters the response by a member status.
 * @param {String} params.size_max Filters the response by a maximum image size, in bytes.
 * @param {String} params.size_min Filters the response by a minimum image size, in bytes.
 * @param {String} params.created_at Specify a comparison filter based on the date and time when the resource was created.
 * @param {String} params.updated_at Specify a comparison filter based on the date and time when the resource was most recently modified.
 * @param {String} params.sort_dir Sorts the response by a set of one or more sort direction and attribute (sort_key) combinations.
 * @param {String} params.sort_key Sorts the response by an attribute, such as name, id, or updated_at.
 * @param {String} params.sort Sorts the response by one or more attribute and sort direction combinations. You can also set multiple sort keys and directions. Default direction is desc.
 * @returns {Promise}
 */
export const fetchImages = (params) =>
  axios.request({
    method: 'get',
    url: cinderBase('images'),
    params,
  });

/**
 * List image members
 * @param {String} imageId The UUID of the image.
 * @returns {Promise}
 */
export const fetchListImageMembers = (imageId) =>
  axios.request({
    method: 'get',
    url: cinderBase(`images/${imageId}/members`),
  });

/**
 * Create image member
 * @param {String} imageId The UUID of the image.
 * @param {Object} data request body
 * @param {String} data.member The ID of the image member.
 * @returns {Promise}
 */
export const createImageMember = (imageId, data) =>
  axios.request({
    method: 'get',
    url: cinderBase(`images/${imageId}/members`),
    data,
  });

/**
 * Update image member
 * @param {String} imageId The UUID of the image.
 * @param {String} memberId The ID of the image member.
 * @param {Object} data request body
 * @param {String} data.status The status of this image member. Value is one of pending, accepted, rejected.
 * @returns {Promise}
 */
export const updateImageMember = (imageId, memberId, data) =>
  axios.request({
    method: 'put',
    url: cinderBase(`images/${imageId}/members/${memberId}`),
    data,
  });

/**
 * Delete image member
 * @param {String} imageId The UUID of the image.
 * @param {String} memberId The ID of the image member.
 * @returns {Promise}
 */
export const deleteImageMember = (imageId, memberId) =>
  axios.request({
    method: 'delete',
    url: cinderBase(`images/${imageId}/members/${memberId}`),
  });

/**
 * List images count
 * @param {Object} params request query
 * @returns {Promise}
 */
export const fetchImagesCountOnGlance = (params) =>
  axios.request({
    method: 'get',
    url: cinderBase('images/count'),
    params,
  });
