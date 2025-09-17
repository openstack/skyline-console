import { cosApiClientV1 } from './cosApi';
import { composeApiUrl } from '../utils/api';

export const imageApi = {
  getImageMaterials: async () => {
    const url = await composeApiUrl(`/images/materials`);
    const response = await cosApiClientV1.get(url);
    return response.data.data;
  },
  /**
   * @param {Object} queryParams
   * @param {number} queryParams.pageSize
   * @param {number} queryParams.pageNum
   * @param {string} queryParams.keyword
   * @param {boolean} queryParams.watch (default: true)
   * @returns {Promise<Array>}
   */
  getImageList: async (queryParams = {}) => {
    const url = await composeApiUrl('/images');
    const response = await cosApiClientV1.get(url, {
      params: queryParams,
    });
    return response.data.data;
  },
  /**
   * @param {Object} queryParams
   * @param {number} queryParams.pageSize
   * @param {number} queryParams.pageNum
   * @param {string} queryParams.keyword
   * @returns {Promise<string>}
   */
  getImageCsvFile: async (queryParams = {}) => {
    const url = await composeApiUrl('/images.csv');
    const response = await cosApiClientV1.get(url, { params: queryParams });
    return response.data.data;
  },
  /**
   * @param {Object} queryParams
   * @param {string} queryParams.file - Name of the file to store
   * @param {string} queryParams.name - Human-readable name of the image
   * @param {string} queryParams.os
   * @param {string} queryParams.destination
   * @param {string} queryParams.domain
   * @param {string} queryParams.project
   * @param {boolean} queryParams.sourceFromAnotherHypervisor
   * @param {string} [queryParams.visibility]
   * @param {File} body
   * @returns {Promise<any>}
   */
  createImage: async (queryParams, body) => {
    const url = await composeApiUrl('/images');
    const response = await cosApiClientV1.post(url, body, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      params: queryParams,
    });
    return response.data.data;
  },
  /**
   * @param {string} imageId
   * @param {Object} body
   * @param {string} [body.name]
   * @param {string} [body.os]
   * @param {string} [body.visibility]
   * @returns {Promise}
   */
  updateImage: async (imageId, body) => {
    const url = await composeApiUrl(`/images/${imageId}`);
    const response = await cosApiClientV1.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },
};
