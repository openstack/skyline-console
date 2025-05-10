import axios from 'axios';
import { dataCenterStore } from 'src/stores/datacenters/DataCenterStore';

const ACCESS_TOKEN_KEY = 'accessToken';
const EXPIRES_KEY = 'expires';

const cosTokenClientV1 = axios.create({
  baseURL: '/cos-api/v1',
});

const renewToken = async () => {
  let { dataCenter } = dataCenterStore;

  if (!dataCenter) {
    await dataCenterStore.fetchDataCenters();
    dataCenter = dataCenterStore.dataCenter;
  }

  if (!dataCenter) {
    throw new Error('No data centers were found. Unable to renew token.');
  }

  // eslint-disable-next-line no-undef
  const { username, password } = COS_API_TOKEN_CREDENTIALS;

  const response = await cosTokenClientV1.post(
    `/datacenters/${dataCenter.name}/tokens`,
    {
      name: username,
      password,
    }
  );

  const { token: accessToken, expires } = response.data.data;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expires.access);

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(EXPIRES_KEY, expiresAt.toISOString());

  return accessToken;
};

const isTokenExpired = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expires = localStorage.getItem(EXPIRES_KEY);

  if (!token || !expires) {
    return true;
  }

  return new Date(expires) <= new Date();
};

export const getToken = async () => {
  if (isTokenExpired()) {
    const token = await renewToken();
    return token;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};
