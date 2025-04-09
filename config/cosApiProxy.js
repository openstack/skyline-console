module.exports = {
  target: 'https://10.32.10.113:4443/api',
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
