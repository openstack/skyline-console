const { getServerConfig } = require('./utils');

module.exports = {
  target: getServerConfig('cosApiUrl'),
  pathRewrite: {
    '^/cos-api': '',
  },
  secure: false,
  changeOrigin: true,
};
