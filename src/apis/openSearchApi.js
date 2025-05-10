import { dataCenterStore } from '../stores/datacenters/DataCenterStore';
import { cosApiClientV1 } from './cosApi';

const composeUrl = async (path) => {
  let { dataCenter } = dataCenterStore;

  if (!dataCenter) {
    await dataCenterStore.fetchDataCenters();
    dataCenter = dataCenterStore.dataCenter;
  }

  if (!dataCenter?.name) {
    throw new Error('Data center name is empty');
  }

  return `/datacenters/${dataCenter.name}/opensearch${path}`;
};

export const openSearchApi = {
  getRequestLink: async (requestId) => {
    const url = await composeUrl(`/requests/${requestId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
