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
        'newsletter-precio-luz-manana': 'noticias/newsletter-precio-luz-manana/index.html',
        'novedades-precio-luz-manana': 'noticias/novedades-precio-luz-manana/index.html',
        'subastas-precio-luz-manana': 'noticias/subastas-precio-luz-manana/index.html',
        'precio-luz-manana': 'precio-luz-manana/index.html',
        'compensacion-del-gas': 'compensacion-del-gas/index.html',
        'descubre-companias-mejores-precios-luz-2024': 'noticias/descubre-companias-mejores-precios-luz-2024/index.html',
        graficas: 'graficas/index.html',
        preguntas: 'preguntas/index.html'
      }
    }
  }
});
