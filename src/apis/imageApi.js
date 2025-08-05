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
    const defaultQueryParams = { watch: true };
    const mergedQueryParams = { ...defaultQueryParams, ...queryParams };
    const response = await cosApiClientV1.get(url, {
      params: mergedQueryParams,
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
   * @param {Object} image
   * @param {string($binary)} image.image (required)
   * @param {string} image.file (required)
   * @param {string} image.name (required)
   * @param {string} image.os (required)
   * @param {string} image.destination (required)
   * @param {string} image.domain (required)
   * @param {string} image.project (required)
   * @param {boolean} image.sourceFromAnotherHypervisor (required)
   * @param {string} image.visibility (optional)
   * @returns {Promise<Object>}
   */
  createImage: async (image) => {
    const url = await composeApiUrl('/images');
    const response = await cosApiClientV1.post(url, image);
    return response.data.data;
  },
};
