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
        'mejor-comercializadora-pvpc': 'noticias/mejor-comercializadora-pvpc/index.html',
        'comparador-tarifas-luz-y-gas': 'noticias/comparador-tarifas-luz-y-gas/index.html',
        'ahorra-en-tu-factura': 'ahorra-en-tu-factura/index.html',
        'horas-baratas-luz': 'horas-baratas-luz/index.html',
        'companias-electricas-mas-baratas-2025': 'companias-electricas-mas-baratas-2025/index.html',
        graficas: 'graficas/index.html',
        preguntas: 'preguntas/index.html'
      },
      output: {
        assetFileNames: (assetInfo) => {
          const cssExtensionRegExp = /\.css$/;
          if (cssExtensionRegExp.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          d3: ['d3-array', 'd3-axis', 'd3-fetch', 'd3-format', 'd3-scale', 'd3-selection', 'd3-shape', 'd3-time-format', 'd3-transition'],
          vendor: ['vanillajs-datepicker']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        dead_code: true,
      }
    },
    cssCodeSplit: true
  },
  optimizeDeps: {
    include: ['d3-array', 'd3-axis', 'd3-fetch', 'd3-format', 'd3-scale', 'd3-selection', 'd3-shape', 'd3-time-format', 'd3-transition']
  },
  server: {
    open: true
  }
});
