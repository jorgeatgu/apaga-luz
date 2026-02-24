import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
    modulePreload: false,
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
        'descubre-mejores-tarifas-luz-2026': 'noticias/descubre-mejores-tarifas-luz-2026/index.html',
        'tarifas-de-totalenergies-luz-y-gas': 'noticias/tarifas-de-totalenergies-luz-y-gas/index.html',
        'como-encontrar-tarifas-de-luz-baratas-en-2026-para-ahorrar-en-tu-factura': 'noticias/como-encontrar-tarifas-de-luz-baratas-en-2026-para-ahorrar-en-tu-factura/index.html',
        'diez-inluencers-ecologicos-para-seguir-redes-sociales': 'noticias/diez-inluencers-ecologicos-para-seguir-redes-sociales/index.html',
        'descubre-las-ventajas-de-desocuparla-con-desokupa-demolition': 'noticias/descubre-las-ventajas-de-desocuparla-con-desokupa-demolition/index.html',
        'mejor-comercializadora-pvpc': 'noticias/mejor-comercializadora-pvpc/index.html',
        'comparador-tarifas-luz-y-gas': 'noticias/comparador-tarifas-luz-y-gas/index.html',
        'ahorra-en-tu-factura': 'ahorra-en-tu-factura/index.html',
        'companias-electricas-mas-baratas-2026': 'noticias/companias-electricas-mas-baratas-2026/index.html',
        'como-afecta-tarifa-por-horas-a-tu-factura': 'noticias/como-afecta-tarifa-por-horas-a-tu-factura/index.html',
        'franjas-horarias-luz-hoy': 'noticias/franjas-horarias-luz-hoy/index.html',
        'luz-barata-2026': 'noticias/luz-barata-2026/index.html',
        'como-ahorrar-precio-luz-por-horas': 'noticias/como-ahorrar-precio-luz-por-horas/index.html',
        'mejores-horas-electrodomesticos': 'noticias/mejores-horas-electrodomesticos/index.html',
        'interpretar-graficas-precio-luz-tiempo-real': 'noticias/interpretar-graficas-precio-luz-tiempo-real/index.html',
        'precio-luz-horas-ahorrar-factura-energetica': 'noticias/precio-luz-horas-ahorrar-factura-energetica/index.html',
        'ofertas-luz-2026': 'noticias/ofertas-luz-2026/index.html',
        'guia-apagon-prolongado': 'noticias/guia-apagon-prolongado/index.html',
        'sistemas-respaldo-electrico': 'noticias/sistemas-respaldo-electrico/index.html',
        'comparador-luz-2026-elige-la-mejor-tarifa': 'noticias/comparador-luz-2026-elige-la-mejor-tarifa/index.html',
        'iva-factura-electrica': 'noticias/iva-factura-electrica/index.html',
        'bono-social-electrico-guia-completa': 'noticias/bono-social-electrico-guia-completa/index.html',
        'consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar': 'noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/index.html',
        'horas-baratas-luz': 'horas-baratas-luz/index.html',
        'tipos-tarifas-electricas': 'tipos-tarifas-electricas/index.html',
        graficas: 'graficas/index.html',
        preguntas: 'preguntas/index.html',
        'guia-tipos-tarifas-electricas-2026': 'noticias/guia-tipos-tarifas-electricas-2026/index.html',
        'precio-luz-canarias-hoy': 'noticias/precio-luz-canarias-hoy/index.html',
        'precio-luz-por-hora': 'noticias/precio-luz-por-hora/index.html',
        'tarifas-electricas-diarias': 'noticias/tarifas-electricas-diarias/index.html'
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
        manualChunks(id) {
          // Separar D3 solo para páginas que lo necesitan
          if (id.includes('d3-')) {
            return 'd3-libs';
          }
          // Separar librerías de terceros
          if (id.includes('node_modules')) {
            if (id.includes('vanillajs-datepicker')) {
              return 'datepicker';
            }
            if (id.includes('web-vitals')) {
              return 'web-vitals';
            }
            return 'vendor';
          }
          // Separar módulos de optimización Analytics (Fase 2.2)
          if (id.includes('analytics-optimizer.js')) {
            return 'analytics-optimizer';
          }
          if (id.includes('web-vitals.js')) {
            return 'web-vitals-monitor';
          }
          if (id.includes('inp-optimizer.js')) {
            return 'inp-optimizer';
          }
          // Separar módulos de navegación compartidos
          if (id.includes('navigation.js')) {
            return 'navigation';
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        dead_code: true,
        // Optimizaciones específicas para analytics
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 2,
        // Mantener nombres de funciones importantes para debugging
        keep_fnames: /gtag|analytics|webVitals/
      },
      mangle: {
        // Proteger nombres de funciones críticas para analytics
        reserved: ['gtag', 'dataLayer', 'analyticsOptimizer', 'webVitalsMonitor']
      }
    },
    cssCodeSplit: true
  },
  optimizeDeps: {
    include: [
      'd3-array', 'd3-axis', 'd3-fetch', 'd3-format',
      'd3-scale', 'd3-selection', 'd3-shape',
      'd3-time-format', 'd3-transition'
    ],
    // Excluir librerías que se cargan de forma lazy
    exclude: ['web-vitals']
  },
  server: {
    open: true,
    headers: {
      // Headers para mejorar caching de recursos analytics
      'Cache-Control': 'public, max-age=3600',
      // CSP para permitir analytics externos
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' *.googletagmanager.com *.google-analytics.com unpkg.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' *.google-analytics.com *.googletagmanager.com ws://localhost:* wss://localhost:*; img-src 'self' data: https:; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com"
    }
  },
  // Configuración específica para producción y analytics
  define: {
    // Variables de entorno para analytics
    __ANALYTICS_ID__: JSON.stringify('G-E9V8ZPM3P0'),
    __ANALYTICS_OPTIMIZED__: true,
    __WEB_VITALS_ENABLED__: true,
    __INP_THRESHOLD__: 200
  }
});
