#!/usr/bin/env node

// Script de migración automática para optimizar Google Analytics en todos los archivos HTML
// Fase 2.2 - Analytics y Web Vitals Optimization

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class AnalyticsOptimizationMigrator {
  constructor() {
    this.processedFiles = 0;
    this.totalFiles = 0;
    this.errors = [];
    this.backupDir = './analytics-backup';
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');

    // Tracking ID para validación
    this.trackingId = 'G-E9V8ZPM3P0';

    console.log('🚀 Analytics Optimization Migrator v2.2');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
    console.log('─'.repeat(60));
  }

  async run() {
    try {
      // Encontrar todos los archivos HTML
      await this.findHtmlFiles();

      // Crear backup si no es dry run
      if (!this.dryRun) {
        await this.createBackup();
      }

      // Procesar archivos
      await this.processFiles();

      // Mostrar resumen
      this.showSummary();

    } catch (error) {
      console.error('❌ Error fatal:', error.message);
      process.exit(1);
    }
  }

  async findHtmlFiles() {
    console.log('🔍 Buscando archivos HTML...');

    // Buscar todos los HTML excepto los de build/dist
    const patterns = [
      '**/*.html',
      '!build/**',
      '!dist/**',
      '!node_modules/**',
      '!analytics-backup/**'
    ];

    this.htmlFiles = await glob(patterns, { ignore: ['build/**', 'dist/**'] });
    this.totalFiles = this.htmlFiles.length;

    console.log(`📁 Encontrados ${this.totalFiles} archivos HTML`);

    if (this.verbose) {
      this.htmlFiles.forEach((file, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}: ${file}`);
      });
    }
  }

  async createBackup() {
    console.log('💾 Creando backup de archivos...');

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Timestamp para el backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSubDir = path.join(this.backupDir, `analytics-backup-${timestamp}`);
    fs.mkdirSync(backupSubDir, { recursive: true });

    for (const file of this.htmlFiles) {
      const backupPath = path.join(backupSubDir, file);
      const backupDirectory = path.dirname(backupPath);

      if (!fs.existsSync(backupDirectory)) {
        fs.mkdirSync(backupDirectory, { recursive: true });
      }

      fs.copyFileSync(file, backupPath);
    }

    console.log(`✅ Backup creado en: ${backupSubDir}`);
  }

  async processFiles() {
    console.log('🔧 Procesando archivos HTML...');

    for (const file of this.htmlFiles) {
      try {
        await this.processFile(file);
        this.processedFiles++;
      } catch (error) {
        this.errors.push({ file, error: error.message });
        console.error(`❌ Error procesando ${file}: ${error.message}`);
      }
    }
  }

  async processFile(filePath) {
    if (this.verbose) {
      console.log(`   📄 Procesando: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Verificar si ya tiene analytics optimizer
    if (content.includes('analytics-optimizer.js') || content.includes('analyticsOptimizer')) {
      if (this.verbose) {
        console.log(`   ⏭️  Saltando ${filePath} (ya optimizado)`);
      }
      return;
    }

    // Verificar si tiene Google Analytics
    if (!content.includes('gtag/js') && !content.includes('google-analytics')) {
      if (this.verbose) {
        console.log(`   ⏭️  Saltando ${filePath} (sin Analytics)`);
      }
      return;
    }

    let newContent = content;
    let hasChanges = false;

    // 1. Optimizar preconnect hints
    newContent = this.optimizePreconnectHints(newContent);
    if (newContent !== content) hasChanges = true;

    // 2. Reemplazar script de Analytics tradicional
    const analyticsReplacement = this.replaceTraditionalAnalytics(newContent);
    if (analyticsReplacement.changed) {
      newContent = analyticsReplacement.content;
      hasChanges = true;
    }

    // 3. Añadir módulos optimizados
    const modulesAdded = this.addOptimizedModules(newContent);
    if (modulesAdded.changed) {
      newContent = modulesAdded.content;
      hasChanges = true;
    }

    // 4. Optimizar orden de carga de scripts
    newContent = this.optimizeScriptOrder(newContent);
    if (newContent !== (modulesAdded.content || analyticsReplacement.content || content)) {
      hasChanges = true;
    }

    // Escribir archivo si hay cambios
    if (hasChanges) {
      if (!this.dryRun) {
        fs.writeFileSync(filePath, newContent);
        console.log(`   ✅ Actualizado: ${filePath}`);
      } else {
        console.log(`   🔄 [DRY RUN] Actualizaría: ${filePath}`);
      }
    } else {
      if (this.verbose) {
        console.log(`   ➡️  Sin cambios: ${filePath}`);
      }
    }
  }

  optimizePreconnectHints(content) {
    // Optimizar hints de preconnect para mejor rendimiento
    let optimized = content;

    // Reemplazar hints básicos con versiones optimizadas
    const preconnectOptimizations = [
      {
        old: /<link rel="preconnect" href="https:\/\/www\.googletagmanager\.com">/g,
        new: `<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">`
      },
      {
        old: /<link rel="preconnect" href="https:\/\/www\.google-analytics\.com">/g,
        new: `<link rel="preconnect" href="https://www.google-analytics.com" crossorigin>
  <link rel="dns-prefetch" href="https://www.google-analytics.com">`
      }
    ];

    preconnectOptimizations.forEach(({ old, new: replacement }) => {
      optimized = optimized.replace(old, replacement);
    });

    return optimized;
  }

  replaceTraditionalAnalytics(content) {
    // Buscar el bloque de Analytics tradicional
    const traditionalAnalyticsRegex = /<!-- Google Analytics -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-E9V8ZPM3P0"><\/script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\s*{\s*dataLayer\.push\(arguments\);\s*}\s*gtag\('js',\s*new Date\(\)\);\s*gtag\('config',\s*'G-E9V8ZPM3P0'\);\s*<\/script>/gs;

    const simpleAnalyticsRegex = /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-E9V8ZPM3P0"><\/script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\s*{\s*dataLayer\.push\(arguments\);\s*}\s*gtag\('js',\s*new Date\(\)\);\s*gtag\('config',\s*'G-E9V8ZPM3P0'\);\s*<\/script>/gs;

    // Script optimizado de reemplazo
    const optimizedAnalyticsScript = `  <!-- Google Analytics Optimizado (Fase 2.2) -->
  <script>
    // Analytics Optimizer - Carga lazy con requestIdleCallback
    window.dataLayer = window.dataLayer || [];

    // Función gtag proxy que usa el optimizer cuando esté listo
    function gtag() {
      if (window.analyticsOptimizer && window.analyticsOptimizer.isAnalyticsReady) {
        // Usar optimizer si está listo
        const [command, ...args] = arguments;
        if (command === 'event') {
          const [action, parameters] = args;
          window.analyticsOptimizer.trackEvent({
            action: action,
            ...parameters
          }, parameters?.priority || 'normal');
        } else {
          dataLayer.push(arguments);
        }
      } else {
        // Encolar hasta que esté listo
        dataLayer.push(arguments);
      }
    }

    // Configuración inicial
    gtag('js', new Date());
    gtag('config', '${this.trackingId}', {
      // Configuración optimizada
      send_page_view: false, // Lo manejará el optimizer
      custom_map: {
        'custom_parameter_1': 'performance_rating'
      }
    });

    // Cargar script principal de forma lazy
    const loadAnalyticsScript = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=${this.trackingId}';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('📊 Google Analytics cargado');
        // Procesar eventos pendientes
        if (window.analyticsOptimizer) {
          window.analyticsOptimizer.processQueuedEvents();
        }
      };
      document.head.appendChild(script);
    };

    // Cargar cuando sea apropiado para el INP
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadAnalyticsScript();
      }, { timeout: 3000 });
    } else {
      setTimeout(loadAnalyticsScript, 1000);
    }
  </script>`;

    let newContent = content;
    let changed = false;

    // Intentar reemplazar con comentario
    if (traditionalAnalyticsRegex.test(content)) {
      newContent = content.replace(traditionalAnalyticsRegex, optimizedAnalyticsScript);
      changed = true;
    }
    // Intentar reemplazar sin comentario
    else if (simpleAnalyticsRegex.test(content)) {
      newContent = content.replace(simpleAnalyticsRegex, optimizedAnalyticsScript);
      changed = true;
    }

    return { content: newContent, changed };
  }

  addOptimizedModules(content) {
    // Verificar si ya están agregados los módulos
    if (content.includes('analytics-optimizer.js') || content.includes('web-vitals.js')) {
      return { content, changed: false };
    }

    // Scripts de módulos optimizados
    const optimizedModules = `
  <!-- Módulos de Optimización Analytics (Fase 2.2) -->
  <script type="module">
    // Cargar módulos de optimización de forma lazy
    const loadOptimizationModules = async () => {
      try {
        // Cargar analytics optimizer
        const { analyticsOptimizer } = await import('/source/javascript/analytics-optimizer.js');

        // Cargar web vitals mejorado
        const { initWebVitals } = await import('/source/javascript/web-vitals.js');

        // Inicializar Web Vitals
        initWebVitals();

        // Enviar page view inicial optimizado
        analyticsOptimizer.trackPageView(window.location.pathname);

        console.log('✅ Módulos de optimización Analytics cargados');

      } catch (error) {
        console.warn('⚠️ Error cargando módulos de optimización:', error);

        // Fallback: inicializar Web Vitals básico
        if (window.webVitals || window.initWebVitals) {
          try {
            window.initWebVitals?.();
          } catch (fallbackError) {
            console.warn('Fallback Web Vitals también falló:', fallbackError);
          }
        }
      }
    };

    // Cargar cuando sea apropiado
    if (document.readyState === 'complete') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadOptimizationModules, { timeout: 2000 });
      } else {
        setTimeout(loadOptimizationModules, 500);
      }
    } else {
      window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadOptimizationModules, { timeout: 3000 });
        } else {
          setTimeout(loadOptimizationModules, 1000);
        }
      }, { once: true });
    }
  </script>`;

    // Insertar antes del cierre de </head> o al final del <head>
    let newContent = content;

    if (content.includes('</head>')) {
      newContent = content.replace('</head>', `${optimizedModules}\n</head>`);
    } else if (content.includes('<head>')) {
      // Si no hay </head>, añadir después de <head>
      newContent = content.replace('<head>', `<head>${optimizedModules}`);
    }

    return {
      content: newContent,
      changed: newContent !== content
    };
  }

  optimizeScriptOrder(content) {
    // Optimizar orden de carga de scripts para mejor INP
    // Mover scripts no críticos al final del body

    let optimized = content;

    // Buscar y mover scripts de terceros al final si están en head
    const thirdPartyScripts = [
      /(<script[^>]*src[^>]*google[^>]*><\/script>)/gi,
      /(<script[^>]*src[^>]*analytics[^>]*><\/script>)/gi
    ];

    // Por ahora solo optimizamos el orden, sin mover scripts
    // ya que la carga lazy maneja mejor el timing

    return optimized;
  }

  showSummary() {
    console.log('\n' + '─'.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('─'.repeat(60));

    console.log(`📁 Total de archivos encontrados: ${this.totalFiles}`);
    console.log(`✅ Archivos procesados: ${this.processedFiles}`);
    console.log(`⏭️  Archivos saltados: ${this.totalFiles - this.processedFiles - this.errors.length}`);

    if (this.errors.length > 0) {
      console.log(`❌ Errores: ${this.errors.length}`);
      console.log('\nErrores detallados:');
      this.errors.forEach(({ file, error }, index) => {
        console.log(`   ${index + 1}. ${file}: ${error}`);
      });
    }

    console.log('\n🎯 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('   ✅ Analytics cargado con requestIdleCallback');
    console.log('   ✅ Event batching con analytics-optimizer.js');
    console.log('   ✅ Web Vitals monitoring mejorado');
    console.log('   ✅ Preconnect hints optimizados');
    console.log('   ✅ Lazy loading de módulos');
    console.log('   ✅ Fallbacks para compatibilidad');

    if (this.dryRun) {
      console.log('\n🔄 MODO DRY RUN - No se realizaron cambios');
      console.log('   Ejecuta sin --dry-run para aplicar cambios');
    } else {
      console.log('\n🚀 MIGRACIÓN COMPLETADA');
      console.log('   Los archivos han sido actualizados');
      console.log('   Backup disponible en: ./analytics-backup/');
    }

    console.log('\n📈 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: npm run build');
    console.log('   2. Probar con: npm run serve');
    console.log('   3. Validar con Lighthouse móvil');
    console.log('   4. Monitorear INP en Search Console');
    console.log('─'.repeat(60));
  }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
  const migrator = new AnalyticsOptimizationMigrator();

  // Mostrar ayuda
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
📖 Analytics Optimization Migrator - Fase 2.2

USAGE:
  node update-analytics-optimization.js [options]

OPTIONS:
  --dry-run    Simular cambios sin modificar archivos
  --verbose    Mostrar información detallada
  --help, -h   Mostrar esta ayuda

EXAMPLES:
  node update-analytics-optimization.js --dry-run --verbose
  node update-analytics-optimization.js
`);
    process.exit(0);
  }

  migrator.run().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = AnalyticsOptimizationMigrator;