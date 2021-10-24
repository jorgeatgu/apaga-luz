const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        noticias: resolve(__dirname, 'noticias/index.html'),
        'nueva-clasificacion-colores-horas': resolve(__dirname, 'noticias/nueva-clasificacion-colores-horas/index.html'),
        datos: resolve(__dirname, 'datos/index.html'),
        contacto: resolve(__dirname, 'contacto/index.html')
      }
    }
  }
}
