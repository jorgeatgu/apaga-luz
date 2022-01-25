const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        noticias: resolve(__dirname, 'noticias/index.html'),
        'nueva-clasificacion-colores-horas': resolve(__dirname, 'noticias/nueva-clasificacion-colores-horas/index.html'),
        'nueva-direccion-web': resolve(__dirname, 'noticias/nueva-direccion-web/index.html'),
        'politica-de-privacidad': resolve(__dirname, 'politica-de-privacidad/index.html'),
        newsletter: resolve(__dirname, 'noticias/newsletter/index.html'),
        contacto: resolve(__dirname, 'contacto/index.html'),
        datos: resolve(__dirname, 'datos/index.html'),
        preguntas: resolve(__dirname, 'preguntas/index.html')
      }
    }
  }
}
