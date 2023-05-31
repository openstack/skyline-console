const { isObject } = require('lodash');
const { getServerConfig } = require('./utils');

const { server, port, host } = getServerConfig();

const getProxyByMap = (apiMap) => {
  const result = {};
  Object.keys(apiMap).forEach((key) => {
    const value = apiMap[key];
    const base = isObject(value) ? value : { target: value };
    result[key] = {
      ...base,
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive',
      },
    };
  });
  return result;
};

const apiMap = {
  '/api/': server,
};

// eslint-disable-next-line no-console
console.log('apiMap', apiMap);
const proxy = getProxyByMap(apiMap);

module.exports = { proxy, host, port };
