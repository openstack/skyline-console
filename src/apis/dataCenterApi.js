import { cosApiClientV1 } from './cosApi';

export const dataCenterApi = {
  getDataCenters: async () => {
    const response = await cosApiClientV1.get('/datacenters');
    const dataCenters = response.data?.data;
    return dataCenters;
  },
};
