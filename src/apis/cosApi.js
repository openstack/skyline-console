import axios from 'axios';
import { getToken } from './cosTokenApi';

export const cosApiClientV1 = axios.create({
  baseURL: '/cos-api/v1',
});

cosApiClientV1.interceptors.request.use(async (config) => {
  if (config.url.endsWith('/datacenters')) {
    return config;
  }
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
