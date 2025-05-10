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

  return `/datacenters/${dataCenter.name}/grafana${path}`;
};

export const grafanaApi = {
  getInstanceLink: async (instanceId) => {
    const url = await composeUrl(`/instances/${instanceId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
