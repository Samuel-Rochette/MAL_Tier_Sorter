const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    "/animelist/**",
    createProxyMiddleware({
      target: "https://myanimelist.net",
      changeOrigin: true
    })
  );
};
