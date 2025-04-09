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

  return `/datacenters/${dataCenter.name}/grafana/${path}`;
};

export const grafanaApi = {
  getInstanceLink: async (instanceId) => {
    const url = composeUrl(`/instances/${instanceId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
