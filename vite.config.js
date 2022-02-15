import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
        noticias: 'noticias/index.html',
        'nueva-clasificacion-colores-horas': 'noticias/nueva-clasificacion-colores-horas/index.html',
        'nueva-direccion-web': 'noticias/nueva-direccion-web/index.html',
        'politica-de-privacidad': 'politica-de-privacidad/index.html',
        newsletter: 'noticias/newsletter/index.html',
        datos: 'datos/index.html',
        preguntas: 'preguntas/index.html'
      }
    }
  }
});
