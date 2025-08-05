import { cosApiClientV1 } from './cosApi';
import { composeApiUrl } from '../utils/api';

export const grafanaApi = {
  getInstanceLink: async (instanceId) => {
    const url = await composeApiUrl(`/grafana/instances/${instanceId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
