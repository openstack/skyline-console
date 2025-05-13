import axios from 'axios';

export const cosApiClientV1 = axios.create({
  baseURL: '/cos-api/v1',
});
