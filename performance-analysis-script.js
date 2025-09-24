// Performance Analysis Script para Apaga Luz - Index.html
// Análisis completo de Core Web Vitals y métricas de performance

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:8001',
      coreWebVitals: {},
      loadingMetrics: {},
      interactionMetrics: {},
      jsAnalysis: {},
      networkAnalysis: {},
      recommendations: []
    };
  }

  async analyze() {
    console.log('🚀 Iniciando análisis de performance de Apaga Luz...\n');

    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    try {
      const page = await browser.newPage();

      // Configurar viewport móvil para pruebas realistas
      await page.setViewport({ width: 375, height: 667 });

      // Habilitar métricas de performance
      await page.setCacheEnabled(false);

      // Configurar interceptación de red
      await page.setRequestInterception(true);
      const networkRequests = [];

      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          resourceType: request.resourceType(),
          timestamp: Date.now()
        });
        request.continue();
      });

      // Configurar interceptación de respuestas
      const responses = [];
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing(),
          headers: response.headers()
        });
      });

      console.log('📊 Navegando a la página...');
      const navigationStart = Date.now();

      await page.goto('http://localhost:8001', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Esperar a que la página se cargue completamente
      await page.waitForSelector('.container-table-price-left', { timeout: 15000 });

      // Análisis de Core Web Vitals
      await this.analyzeCoreWebVitals(page);

      // Análisis de métricas de carga
      await this.analyzeLoadingMetrics(page, navigationStart);

      // Análisis de interacciones
      await this.analyzeInteractions(page);

      // Análisis de JavaScript
      await this.analyzeJavaScript(page);

      // Análisis de red
      this.analyzeNetwork(networkRequests, responses);

      // Generar recomendaciones
      this.generateRecommendations();

    } catch (error) {
      console.error('❌ Error durante el análisis:', error);
      this.results.error = error.message;
    } finally {
      await browser.close();
    }

    return this.results;
  }

  async analyzeCoreWebVitals(page) {
    console.log('🎯 Analizando Core Web Vitals...');

    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: null,
          FID: null,
          CLS: null,
          FCP: null,
          TTFB: null,
          INP: null
        };

        // Usar PerformanceObserver para métricas reales
        if ('PerformanceObserver' in window) {
          // LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.LCP = lastEntry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // FCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) vitals.FCP = fcpEntry.startTime;
          }).observe({ type: 'paint', buffered: true });

          // CLS
          new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.CLS = clsValue;
          }).observe({ type: 'layout-shift', buffered: true });

          // TTFB
          const navTiming = performance.getEntriesByType('navigation')[0];
          if (navTiming) {
            vitals.TTFB = navTiming.responseStart - navTiming.requestStart;
          }
        }

        // Esperar un poco para recopilar métricas
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    this.results.coreWebVitals = webVitals;
    console.log('✅ Core Web Vitals analizados');
  }

  async analyzeLoadingMetrics(page, navigationStart) {
    console.log('⏱️  Analizando métricas de carga...');

    const loadingMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        resourceLoadTime: navigation.loadEventEnd - navigation.navigationStart
      };
    });

    // Análisis específico de recursos críticos
    const criticalResources = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src]')).map(el => ({
        type: el.tagName.toLowerCase(),
        src: el.src || el.href,
        async: el.async,
        defer: el.defer,
        blocking: !el.async && !el.defer && el.tagName === 'SCRIPT'
      }));
    });

    this.results.loadingMetrics = { ...loadingMetrics, criticalResources };
    console.log('✅ Métricas de carga analizadas');
  }

  async analyzeInteractions(page) {
    console.log('🖱️  Analizando interacciones...');

    // Simular clicks en elementos principales para medir INP
    const interactions = [];

    try {
      // Test de checkbox interactions
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
        const start = Date.now();
        await checkboxes[i].click();
        const end = Date.now();
        interactions.push({
          type: 'checkbox',
          element: `checkbox-${i}`,
          duration: end - start
        });
        await page.waitForTimeout(100);
      }

      // Test de button interactions (si existen)
      const buttons = await page.$$('button, .btn');
      for (let i = 0; i < Math.min(buttons.length, 2); i++) {
        const start = Date.now();
        await buttons[i].click();
        const end = Date.now();
        interactions.push({
          type: 'button',
          element: `button-${i}`,
          duration: end - start
        });
        await page.waitForTimeout(100);
      }

    } catch (error) {
      console.warn('⚠️ Algunos elementos no pudieron ser probados:', error.message);
    }

    // Analizar event listeners
    const eventListeners = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let listenerCount = 0;
      let passiveCount = 0;

      // Esta es una aproximación ya que no podemos acceder directamente a listeners
      Array.from(elements).forEach(el => {
        if (el.onclick) listenerCount++;
        if (el.onmouseover) listenerCount++;
        if (el.onscroll) listenerCount++;
      });

      return { total: listenerCount, passive: passiveCount };
    });

    this.results.interactionMetrics = {
      interactions,
      eventListeners,
      averageInteractionTime: interactions.length > 0
        ? interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length
        : null
    };

    console.log('✅ Análisis de interacciones completado');
  }

  async analyzeJavaScript(page) {
    console.log('📜 Analizando JavaScript...');

    // Análisis de JavaScript blocking tasks
    const jsAnalysis = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script')).map(script => ({
        src: script.src,
        inline: !script.src,
        async: script.async,
        defer: script.defer,
        type: script.type,
        size: script.innerHTML ? script.innerHTML.length : null
      }));

      // Detectar long tasks si PerformanceObserver está disponible
      let longTasks = [];
      if ('PerformanceObserver' in window) {
        try {
          new PerformanceObserver((list) => {
            longTasks = list.getEntries().map(entry => ({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            }));
          }).observe({ type: 'longtask', buffered: true });
        } catch (e) {
          console.warn('Long tasks no disponibles:', e);
        }
      }

      return {
        scripts,
        longTasks,
        totalScripts: scripts.length,
        blockingScripts: scripts.filter(s => !s.async && !s.defer && !s.inline).length
      };
    });

    this.results.jsAnalysis = jsAnalysis;
    console.log('✅ Análisis de JavaScript completado');
  }

  analyzeNetwork(requests, responses) {
    console.log('🌐 Analizando tráfico de red...');

    const analysis = {
      totalRequests: requests.length,
      requestsByType: {},
      largestResources: [],
      slowestResources: []
    };

    // Agrupar por tipo de recurso
    requests.forEach(req => {
      analysis.requestsByType[req.resourceType] =
        (analysis.requestsByType[req.resourceType] || 0) + 1;
    });

    // Analizar respuestas para encontrar recursos lentos y grandes
    responses.forEach(res => {
      if (res.timing) {
        const totalTime = res.timing.receiveHeadersEnd - res.timing.requestTime;
        analysis.slowestResources.push({
          url: res.url.substring(0, 100),
          timing: totalTime,
          status: res.status
        });
      }
    });

    // Ordenar por tiempo
    analysis.slowestResources.sort((a, b) => b.timing - a.timing);
    analysis.slowestResources = analysis.slowestResources.slice(0, 10);

    this.results.networkAnalysis = analysis;
    console.log('✅ Análisis de red completado');
  }

  generateRecommendations() {
    console.log('💡 Generando recomendaciones...');

    const recommendations = [];

    // Core Web Vitals recommendations
    if (this.results.coreWebVitals.LCP && this.results.coreWebVitals.LCP > 2500) {
      recommendations.push({
        priority: 'alta',
        metric: 'LCP',
        issue: `LCP es ${Math.round(this.results.coreWebVitals.LCP)}ms (>2.5s)`,
        solution: 'Optimizar carga de imágenes hero, implement lazy loading, usar WebP'
      });
    }

    if (this.results.coreWebVitals.CLS && this.results.coreWebVitals.CLS > 0.1) {
      recommendations.push({
        priority: 'alta',
        metric: 'CLS',
        issue: `CLS es ${this.results.coreWebVitals.CLS.toFixed(3)} (>0.1)`,
        solution: 'Reservar espacio para contenido dinámico, fijar dimensiones de imágenes'
      });
    }

    // JavaScript recommendations
    if (this.results.jsAnalysis.blockingScripts > 0) {
      recommendations.push({
        priority: 'media',
        metric: 'JavaScript',
        issue: `${this.results.jsAnalysis.blockingScripts} scripts bloqueantes encontrados`,
        solution: 'Añadir async/defer a scripts no críticos, mover scripts al final del body'
      });
    }

    // Interaction recommendations
    if (this.results.interactionMetrics.averageInteractionTime > 200) {
      recommendations.push({
        priority: 'alta',
        metric: 'INP',
        issue: `Tiempo promedio de interacción: ${Math.round(this.results.interactionMetrics.averageInteractionTime)}ms (>200ms)`,
        solution: 'Optimizar event handlers, implementar debouncing, usar requestIdleCallback'
      });
    }

    // Network recommendations
    if (this.results.networkAnalysis.totalRequests > 50) {
      recommendations.push({
        priority: 'media',
        metric: 'Red',
        issue: `${this.results.networkAnalysis.totalRequests} requests totales`,
        solution: 'Implementar bundling, reducir requests, usar HTTP/2 push'
      });
    }

    this.results.recommendations = recommendations;
    console.log(`✅ ${recommendations.length} recomendaciones generadas`);
  }

  async saveResults() {
    const fileName = `performance-report-${Date.now()}.json`;
    const filePath = path.join(__dirname, fileName);

    try {
      fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2));
      console.log(`📊 Reporte guardado en: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Error guardando reporte:', error);
      return null;
    }
  }

  generateConsoleReport() {
    console.log('\n📋 REPORTE DE PERFORMANCE - APAGA LUZ INDEX.HTML');
    console.log('='.repeat(60));

    console.log('\n🎯 CORE WEB VITALS:');
    console.log('─'.repeat(30));
    const cwv = this.results.coreWebVitals;
    console.log(`LCP (Largest Contentful Paint): ${cwv.LCP ? Math.round(cwv.LCP) + 'ms' : 'N/A'}`);
    console.log(`FCP (First Contentful Paint):   ${cwv.FCP ? Math.round(cwv.FCP) + 'ms' : 'N/A'}`);
    console.log(`CLS (Cumulative Layout Shift):  ${cwv.CLS ? cwv.CLS.toFixed(3) : 'N/A'}`);
    console.log(`TTFB (Time to First Byte):      ${cwv.TTFB ? Math.round(cwv.TTFB) + 'ms' : 'N/A'}`);

    console.log('\n⏱️  MÉTRICAS DE CARGA:');
    console.log('─'.repeat(30));
    const load = this.results.loadingMetrics;
    console.log(`DOM Content Loaded: ${Math.round(load.domContentLoaded || 0)}ms`);
    console.log(`Load Complete:      ${Math.round(load.loadComplete || 0)}ms`);
    console.log(`DOM Interactive:    ${Math.round(load.domInteractive || 0)}ms`);
    console.log(`Scripts críticos:   ${load.criticalResources?.filter(r => r.blocking).length || 0}`);

    console.log('\n🖱️  MÉTRICAS DE INTERACCIÓN:');
    console.log('─'.repeat(30));
    const inter = this.results.interactionMetrics;
    console.log(`Interacciones probadas: ${inter.interactions?.length || 0}`);
    console.log(`Tiempo promedio:        ${inter.averageInteractionTime ? Math.round(inter.averageInteractionTime) + 'ms' : 'N/A'}`);
    console.log(`Event listeners:        ${inter.eventListeners?.total || 0}`);

    console.log('\n📜 ANÁLISIS JAVASCRIPT:');
    console.log('─'.repeat(30));
    const js = this.results.jsAnalysis;
    console.log(`Total scripts:      ${js.totalScripts || 0}`);
    console.log(`Scripts bloqueantes: ${js.blockingScripts || 0}`);
    console.log(`Long tasks:         ${js.longTasks?.length || 0}`);

    console.log('\n🌐 ANÁLISIS DE RED:');
    console.log('─'.repeat(30));
    const net = this.results.networkAnalysis;
    console.log(`Total requests:     ${net.totalRequests || 0}`);
    console.log('Por tipo:');
    Object.entries(net.requestsByType || {}).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\n💡 RECOMENDACIONES PRINCIPALES:');
    console.log('─'.repeat(40));
    if (this.results.recommendations.length === 0) {
      console.log('🎉 ¡Excelente! No se encontraron problemas críticos.');
    } else {
      this.results.recommendations
        .sort((a, b) => a.priority === 'alta' ? -1 : 1)
        .slice(0, 5)
        .forEach((rec, i) => {
          const priority = rec.priority === 'alta' ? '🔴' : '🟡';
          console.log(`${i + 1}. ${priority} [${rec.metric}] ${rec.issue}`);
          console.log(`   💡 ${rec.solution}\n`);
        });
    }

    console.log('\n🎯 TARGETS DE PERFORMANCE:');
    console.log('─'.repeat(30));
    console.log('✅ LCP: <2.5s (Good) | <4s (Needs Improvement)');
    console.log('✅ FID/INP: <100ms (Good) | <300ms (Needs Improvement)');
    console.log('✅ CLS: <0.1 (Good) | <0.25 (Needs Improvement)');
    console.log('✅ FCP: <1.8s (Good) | <3s (Needs Improvement)');
    console.log('\n='.repeat(60));
  }
}

// Función principal
async function runAnalysis() {
  const analyzer = new PerformanceAnalyzer();

  try {
    await analyzer.analyze();
    analyzer.generateConsoleReport();
    await analyzer.saveResults();
  } catch (error) {
    console.error('❌ Error en el análisis:', error);
  }
}

// Verificar si se ejecuta directamente
if (require.main === module) {
  runAnalysis();
}

module.exports = PerformanceAnalyzer;