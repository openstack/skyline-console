import { composeApiUrl } from 'src/utils/api';
import { cosApiClientV1 } from './cosApi';

export const openSearchApi = {
  getRequestLink: async (requestId) => {
    const url = await composeApiUrl(`/opensearch/requests/${requestId}`);
    const response = await cosApiClientV1.get(url);
    return response.data.data.link;
  },
};
