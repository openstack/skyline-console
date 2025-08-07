import { dataCenterStore } from '../stores/datacenters/DataCenterStore';

/**
 * @param {string} path
 * @returns {Promise<string>}
 * @example
 * composeApiUrl('/images')
 */
export const composeApiUrl = async (path) => {
  let { dataCenter } = dataCenterStore;

  if (!dataCenter) {
    await dataCenterStore.fetchDataCenters();
    dataCenter = dataCenterStore.dataCenter;
  }

  if (!dataCenter?.name) {
    throw new Error('Data center name is empty');
  }

  return `/datacenters/${dataCenter.name}${path}`;
};
