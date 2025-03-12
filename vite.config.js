import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
        noticias: 'noticias/index.html',
        'tarifas-placas-solares': 'noticias/tarifas-placas-solares/index.html',
        'nueva-clasificacion-colores-horas': 'noticias/nueva-clasificacion-colores-horas/index.html',
        'nueva-direccion-web': 'noticias/nueva-direccion-web/index.html',
        'politica-de-privacidad': 'politica-de-privacidad/index.html',
        'newsletter-precio-luz-manana': 'noticias/newsletter-precio-luz-manana/index.html',
        'subastas-precio-luz-manana': 'noticias/subastas-precio-luz-manana/index.html',
        'precio-luz-manana': 'precio-luz-manana/index.html',
        'compensacion-del-gas': 'compensacion-del-gas/index.html',
        'descubre-companias-mejores-precios-luz-2024': 'noticias/descubre-companias-mejores-precios-luz-2024/index.html',
        'descubre-mejores-tarifas-luz-2025': 'noticias/descubre-mejores-tarifas-luz-2025/index.html',
        'tarifas-de-totalenergies-luz-y-gas': 'noticias/tarifas-de-totalenergies-luz-y-gas/index.html',
        'diez-inluencers-ecologicos-para-seguir-redes-sociales': 'noticias/diez-inluencers-ecologicos-para-seguir-redes-sociales/index.html',
        graficas: 'graficas/index.html',
        preguntas: 'preguntas/index.html'
      }
    }
  }
});
