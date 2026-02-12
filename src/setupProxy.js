// This file is used to set up a proxy in the development environment
// It helps bypass CORS issues when communicating with the backend API

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    })
  );
};
