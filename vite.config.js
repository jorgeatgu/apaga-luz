const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        heatmap: resolve(__dirname, 'heatmap/index.html')
      }
    }
  }
}
