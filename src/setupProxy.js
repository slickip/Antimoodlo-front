const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://37.220.83.144:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', //убирает /api из пути
      },
    })
  );
};
