// Quick Performance Analysis para Apaga Luz - Optimizado para rapidez
const puppeteer = require('puppeteer');

async function quickPerformanceTest() {
  console.log('🚀 Análisis rápido de performance - Apaga Luz\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Configurar métricas
  await page.setCacheEnabled(false);

  const networkRequests = [];
  await page.setRequestInterception(true);
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      type: request.resourceType()
    });
    request.continue();
  });

  try {
    console.log('📊 Navegando y midiendo...');

    // Navegar y medir tiempo básico
    const startTime = Date.now();
    await page.goto('http://localhost:8001', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const domLoadTime = Date.now() - startTime;

    // Esperar contenido dinámico
    await page.waitForSelector('.container-table-price-left', { timeout: 10000 });
    const fullLoadTime = Date.now() - startTime;

    // Obtener métricas básicas de performance
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        // Métricas básicas
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart,

        // Paint metrics
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,

        // Timing details
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        connect: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,

        // Resource counts
        resourceCount: performance.getEntriesByType('resource').length
      };
    });

    // Web Vitals usando PerformanceObserver
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { LCP: null, CLS: 0, FID: null };
        let resolved = false;

        // LCP
        if ('PerformanceObserver' in window) {
          try {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              vitals.LCP = entries[entries.length - 1]?.startTime;
            }).observe({ type: 'largest-contentful-paint', buffered: true });

            // CLS
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  vitals.CLS += entry.value;
                }
              }
            }).observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            console.warn('Web Vitals no disponibles');
          }
        }

        // Resolver después de 2 segundos
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(vitals);
          }
        }, 2000);
      });
    });

    // Test rápido de interacciones
    console.log('🖱️  Probando interacciones...');
    const interactionTimes = [];

    try {
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
        const start = performance.now();
        await checkboxes[i].click();
        const end = performance.now();
        interactionTimes.push(end - start);
        await page.waitForTimeout(100);
      }
    } catch (e) {
      console.warn('Algunos elementos no pudieron probarse');
    }

    // Análisis de JavaScript
    const jsAnalysis = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      let inlineScripts = 0;
      let externalScripts = 0;
      let blockingScripts = 0;

      scripts.forEach(script => {
        if (script.src) {
          externalScripts++;
          if (!script.async && !script.defer) {
            blockingScripts++;
          }
        } else {
          inlineScripts++;
        }
      });

      return {
        total: scripts.length,
        external: externalScripts,
        inline: inlineScripts,
        blocking: blockingScripts
      };
    });

    // Resultados
    const results = {
      timestamp: new Date().toISOString(),
      loadTimes: {
        domLoad: domLoadTime,
        fullLoad: fullLoadTime,
        domContentLoaded: Math.round(metrics.domContentLoaded),
        loadComplete: Math.round(metrics.loadComplete)
      },
      coreWebVitals: {
        LCP: webVitals.LCP ? Math.round(webVitals.LCP) : null,
        CLS: Math.round(webVitals.CLS * 1000) / 1000,
        FCP: metrics.firstContentfulPaint ? Math.round(metrics.firstContentfulPaint) : null,
        TTFB: Math.round(metrics.ttfb)
      },
      network: {
        totalRequests: networkRequests.length,
        resources: metrics.resourceCount,
        requestsByType: networkRequests.reduce((acc, req) => {
          acc[req.type] = (acc[req.type] || 0) + 1;
          return acc;
        }, {})
      },
      interactions: {
        tested: interactionTimes.length,
        averageTime: interactionTimes.length > 0 ?
          Math.round(interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length) : null,
        maxTime: interactionTimes.length > 0 ? Math.round(Math.max(...interactionTimes)) : null
      },
      javascript: jsAnalysis
    };

    // Generar reporte
    generateReport(results);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

function generateReport(results) {
  console.log('\n📋 REPORTE DE PERFORMANCE - APAGA LUZ');
  console.log('='.repeat(50));

  console.log('\n⏱️  TIEMPOS DE CARGA:');
  console.log(`DOM Load:           ${results.loadTimes.domLoad}ms`);
  console.log(`Full Load:          ${results.loadTimes.fullLoad}ms`);
  console.log(`DOM Content Loaded: ${results.loadTimes.domContentLoaded}ms`);
  console.log(`Load Complete:      ${results.loadTimes.loadComplete}ms`);

  console.log('\n🎯 CORE WEB VITALS:');
  const gradeMetric = (value, thresholds) => {
    if (!value) return 'N/A';
    return value <= thresholds[0] ? '✅ Good' :
           value <= thresholds[1] ? '⚠️  Needs Improvement' :
           '❌ Poor';
  };

  console.log(`LCP:  ${results.coreWebVitals.LCP}ms ${gradeMetric(results.coreWebVitals.LCP, [2500, 4000])}`);
  console.log(`FCP:  ${results.coreWebVitals.FCP}ms ${gradeMetric(results.coreWebVitals.FCP, [1800, 3000])}`);
  console.log(`CLS:  ${results.coreWebVitals.CLS} ${gradeMetric(results.coreWebVitals.CLS, [0.1, 0.25])}`);
  console.log(`TTFB: ${results.coreWebVitals.TTFB}ms ${gradeMetric(results.coreWebVitals.TTFB, [800, 1800])}`);

  console.log('\n🖱️  INTERACCIONES (INP):');
  if (results.interactions.averageTime) {
    console.log(`Promedio: ${results.interactions.averageTime}ms ${gradeMetric(results.interactions.averageTime, [200, 500])}`);
    console.log(`Máximo:   ${results.interactions.maxTime}ms`);
    console.log(`Probadas: ${results.interactions.tested}`);
  } else {
    console.log('No se pudieron probar interacciones');
  }

  console.log('\n🌐 RED:');
  console.log(`Total requests: ${results.network.totalRequests}`);
  console.log(`Recursos:       ${results.network.resources}`);
  console.log('Por tipo:');
  Object.entries(results.network.requestsByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('\n📜 JAVASCRIPT:');
  console.log(`Total scripts:      ${results.javascript.total}`);
  console.log(`Scripts externos:   ${results.javascript.external}`);
  console.log(`Scripts inline:     ${results.javascript.inline}`);
  console.log(`Scripts bloqueantes: ${results.javascript.blocking}`);

  console.log('\n💡 RECOMENDACIONES RÁPIDAS:');

  // Análisis automático de problemas
  const issues = [];

  if (results.coreWebVitals.LCP > 2500) {
    issues.push('🔴 LCP alto - Optimizar carga de contenido principal');
  }
  if (results.coreWebVitals.CLS > 0.1) {
    issues.push('🔴 CLS alto - Reservar espacio para contenido dinámico');
  }
  if (results.interactions.averageTime > 200) {
    issues.push('🔴 INP alto - Optimizar event handlers');
  }
  if (results.javascript.blocking > 2) {
    issues.push('🟡 Muchos scripts bloqueantes - Usar async/defer');
  }
  if (results.network.totalRequests > 50) {
    issues.push('🟡 Muchas requests - Considerar bundling');
  }

  if (issues.length === 0) {
    console.log('🎉 ¡Excelente! Performance dentro de los rangos óptimos');
  } else {
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  }

  console.log('\n='.repeat(50));

  // Guardar JSON
  require('fs').writeFileSync(
    `performance-quick-${Date.now()}.json`,
    JSON.stringify(results, null, 2)
  );
  console.log('📊 Reporte JSON guardado\n');
}

// Ejecutar
quickPerformanceTest();