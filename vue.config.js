module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.123.127:3000/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
    }
  }
}