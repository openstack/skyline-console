const { getServerConfig } = require('./utils');

module.exports = {
  target: getServerConfig('cosApiUrl'),
  pathRewrite: {
    '^/cos-api': '',
  },
  secure: false,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
  },
};
