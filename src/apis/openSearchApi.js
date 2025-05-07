import { dataCenterStore } from '../stores/datacenters/DataCenterStore';
import { cosApiClientV1 } from './cosApi';

const composeUrl = (path) => {
  const { dataCenter } = dataCenterStore;

  if (!dataCenter) {
    throw new Error('Data center is empty');
  }

  if (!dataCenter.name) {
    throw new Error('Data center name is empty');
  }

  return `/datacenters/${dataCenter.name}/opensearch/${path}`;
};

export const openSearchApi = {
  getRequestLink: async (requestId) => {
    const url = composeUrl(`/requests/${requestId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
