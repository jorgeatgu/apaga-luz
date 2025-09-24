// Análisis Completo de Performance para Apaga Luz
// Usando Puppeteer con Chrome DevTools Protocol para métricas precisas

const puppeteer = require('puppeteer');
const fs = require('fs');

class ComprehensivePerformanceAnalysis {
  constructor() {
    this.url = 'http://localhost:8001';
    this.results = {
      timestamp: new Date().toISOString(),
      url: this.url,
      mobile: {},
      desktop: {},
      networkAnalysis: {},
      jsAnalysis: {},
      interactionAnalysis: {},
      recommendations: []
    };
  }

  async analyze() {
    console.log('🚀 ANÁLISIS COMPLETO DE PERFORMANCE - APAGA LUZ');
    console.log('='.repeat(60));

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=NetworkService',
        '--disable-features=TranslateUI'
      ]
    });

    try {
      // Análisis móvil
      console.log('\n📱 EJECUTANDO ANÁLISIS MÓVIL...');
      this.results.mobile = await this.runDeviceAnalysis(browser, 'mobile');

      // Análisis desktop
      console.log('\n💻 EJECUTANDO ANÁLISIS DESKTOP...');
      this.results.desktop = await this.runDeviceAnalysis(browser, 'desktop');

      // Análisis específicos adicionales
      await this.analyzeNetworkPerformance(browser);
      await this.analyzeInteractionPerformance(browser);
      await this.analyzeJavaScriptPerformance(browser);

      this.generateRecommendations();
      this.generateComprehensiveReport();
      this.saveReport();

    } catch (error) {
      console.error('❌ Error en análisis:', error);
    } finally {
      await browser.close();
    }

    return this.results;
  }

  async runDeviceAnalysis(browser, device) {
    const page = await browser.newPage();

    // Configurar dispositivo
    if (device === 'mobile') {
      await page.setViewport({ width: 375, height: 667 });
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );
    } else {
      await page.setViewport({ width: 1920, height: 1080 });
    }

    // Habilitar métricas de performance
    await page.setCacheEnabled(false);

    // Configurar CDP para métricas precisas
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await client.send('Runtime.enable');

    // Capturar requests de red
    const networkRequests = [];
    const responses = [];

    await page.setRequestInterception(true);
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
      request.continue();
    });

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentLength: response.headers()['content-length'],
        timing: response.timing()
      });
    });

    const navigationStart = Date.now();

    try {
      // Navegar con timing detallado
      await page.goto(this.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Esperar contenido dinámico crítico
      await page.waitForSelector('.container-table-price-left', { timeout: 15000 });
      await page.waitForTimeout(3000); // Esperar estabilización

      const navigationEnd = Date.now();

      // Obtener métricas del navegador
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');

        return {
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            loadComplete: navigation.loadEventEnd - navigation.navigationStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart,
            ttfb: navigation.responseStart - navigation.navigationStart,
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            connect: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            processing: navigation.domComplete - navigation.responseEnd
          },
          paint: {
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null
          },
          resources: {
            total: resources.length,
            scripts: resources.filter(r => r.initiatorType === 'script').length,
            stylesheets: resources.filter(r => r.initiatorType === 'css').length,
            images: resources.filter(r => r.initiatorType === 'img').length,
            fonts: resources.filter(r => r.name.includes('font')).length,
            totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
          }
        };
      });

      // Web Vitals usando PerformanceObserver
      const webVitals = await this.measureWebVitals(page);

      // Layout Shift tracking específico
      const layoutShifts = await this.measureLayoutShifts(page);

      // Long Tasks tracking
      const longTasks = await this.measureLongTasks(page);

      await page.close();

      return {
        device,
        totalTime: navigationEnd - navigationStart,
        performance: performanceMetrics,
        webVitals,
        layoutShifts,
        longTasks,
        network: {
          requests: networkRequests.length,
          responses: responses.length,
          totalSize: this.calculateTotalSize(responses),
          requestsByType: this.groupRequestsByType(networkRequests)
        }
      };

    } catch (error) {
      console.error(`❌ Error en análisis ${device}:`, error);
      await page.close();
      return { device, error: error.message };
    }
  }

  async measureWebVitals(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: null,
          FID: null,
          CLS: 0,
          FCP: null,
          TTFB: null,
          INP: null
        };

        // Usar navigation timing para TTFB
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          vitals.TTFB = nav.responseStart - nav.requestStart;
        }

        // Usar paint timing para FCP
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(p => p.name === 'first-contentful-paint');
        if (fcp) vitals.FCP = fcp.startTime;

        if ('PerformanceObserver' in window) {
          let observersCount = 0;
          const maxObservers = 3;

          const checkComplete = () => {
            observersCount++;
            if (observersCount >= maxObservers) {
              resolve(vitals);
            }
          };

          // LCP
          try {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                vitals.LCP = entries[entries.length - 1].startTime;
              }
              checkComplete();
            }).observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            checkComplete();
          }

          // CLS
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  vitals.CLS += entry.value;
                }
              }
              checkComplete();
            }).observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            checkComplete();
          }

          // Event timing for potential INP
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.duration > 40) {
                  vitals.INP = Math.max(vitals.INP || 0, entry.duration);
                }
              }
              checkComplete();
            }).observe({ type: 'event', buffered: true });
          } catch (e) {
            checkComplete();
          }
        } else {
          resolve(vitals);
        }

        // Timeout fallback
        setTimeout(() => resolve(vitals), 4000);
      });
    });
  }

  async measureLayoutShifts(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const shifts = [];

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              shifts.push({
                value: entry.value,
                startTime: entry.startTime,
                hadRecentInput: entry.hadRecentInput,
                sources: entry.sources ? entry.sources.length : 0
              });
            }
          });

          try {
            observer.observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            console.warn('Layout shift observer not supported');
          }
        }

        setTimeout(() => {
          resolve({
            totalShifts: shifts.length,
            maxShift: shifts.length > 0 ? Math.max(...shifts.map(s => s.value)) : 0,
            totalCLS: shifts.reduce((sum, s) => sum + (s.hadRecentInput ? 0 : s.value), 0),
            shifts: shifts.slice(0, 5) // Top 5 shifts
          });
        }, 3000);
      });
    });
  }

  async measureLongTasks(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks = [];

        if ('PerformanceObserver' in window) {
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                tasks.push({
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                });
              }
            }).observe({ type: 'longtask', buffered: true });
          } catch (e) {
            console.warn('Long task observer not supported');
          }
        }

        setTimeout(() => {
          resolve({
            totalTasks: tasks.length,
            totalBlockingTime: tasks.reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0),
            longestTask: tasks.length > 0 ? Math.max(...tasks.map(t => t.duration)) : 0,
            tasks: tasks.slice(0, 10) // Top 10 tasks
          });
        }, 3000);
      });
    });
  }

  calculateTotalSize(responses) {
    return responses.reduce((total, response) => {
      const size = parseInt(response.contentLength) || 0;
      return total + size;
    }, 0);
  }

  groupRequestsByType(requests) {
    return requests.reduce((acc, request) => {
      acc[request.resourceType] = (acc[request.resourceType] || 0) + 1;
      return acc;
    }, {});
  }

  async analyzeNetworkPerformance(browser) {
    console.log('🌐 Analizando performance de red...');

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });

    const requests = [];
    await page.setRequestInterception(true);

    page.on('request', request => {
      requests.push({
        url: request.url(),
        type: request.resourceType(),
        size: request.headers()['content-length'],
        timestamp: Date.now()
      });
      request.continue();
    });

    await page.goto(this.url, { waitUntil: 'networkidle0', timeout: 30000 });

    this.results.networkAnalysis = {
      totalRequests: requests.length,
      criticalPathRequests: requests.filter(r =>
        r.type === 'document' || r.type === 'stylesheet' || r.type === 'script'
      ).length,
      imageRequests: requests.filter(r => r.type === 'image').length,
      fontRequests: requests.filter(r => r.type === 'font').length,
      thirdPartyRequests: requests.filter(r =>
        !r.url.includes('localhost') && !r.url.includes('apaga-luz.com')
      ).length
    };

    await page.close();
  }

  async analyzeInteractionPerformance(browser) {
    console.log('🖱️ Analizando performance de interacciones...');

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });

    await page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.container-table-price-left');

    const interactions = [];

    try {
      // Test checkbox interactions
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
        const start = Date.now();
        await checkboxes[i].click();
        const end = Date.now();

        interactions.push({
          type: 'checkbox',
          duration: end - start,
          element: `checkbox-${i}`
        });

        await page.waitForTimeout(200);
      }

      // Analizar event listeners
      const listenerAnalysis = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let totalListeners = 0;
        let passiveListeners = 0;

        // Aproximación de listeners
        elements.forEach(el => {
          if (el.onclick) totalListeners++;
          if (el.onmouseover) totalListeners++;
          if (el.addEventListener) totalListeners++; // Aproximación
        });

        return {
          estimatedListeners: totalListeners,
          passiveListeners,
          elementsWithHandlers: document.querySelectorAll('[onclick], [onmouseover]').length
        };
      });

      this.results.interactionAnalysis = {
        interactions,
        averageInteractionTime: interactions.length > 0 ?
          interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length : null,
        slowestInteraction: interactions.length > 0 ?
          Math.max(...interactions.map(i => i.duration)) : null,
        ...listenerAnalysis
      };

    } catch (error) {
      console.warn('⚠️ Error en análisis de interacciones:', error.message);
    }

    await page.close();
  }

  async analyzeJavaScriptPerformance(browser) {
    console.log('📜 Analizando performance de JavaScript...');

    const page = await browser.newPage();
    await page.goto(this.url, { waitUntil: 'domcontentloaded' });

    const jsAnalysis = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const inlineScripts = scripts.filter(s => !s.src);
      const externalScripts = scripts.filter(s => s.src);
      const blockingScripts = externalScripts.filter(s => !s.async && !s.defer);

      // Aproximar tamaño de JavaScript inline
      const inlineSize = inlineScripts.reduce((sum, script) =>
        sum + (script.innerHTML ? script.innerHTML.length : 0), 0
      );

      // Detectar frameworks/libraries
      const detectedLibraries = [];
      if (window.d3) detectedLibraries.push('D3.js');
      if (window.gtag) detectedLibraries.push('Google Analytics');
      if (window.webVitalsMonitor) detectedLibraries.push('Web Vitals Monitor');
      if (window.analyticsOptimizer) detectedLibraries.push('Analytics Optimizer');

      return {
        totalScripts: scripts.length,
        inlineScripts: inlineScripts.length,
        externalScripts: externalScripts.length,
        blockingScripts: blockingScripts.length,
        inlineSize: Math.round(inlineSize / 1024), // KB
        detectedLibraries,
        asyncScripts: externalScripts.filter(s => s.async).length,
        deferredScripts: externalScripts.filter(s => s.defer).length
      };
    });

    this.results.jsAnalysis = jsAnalysis;
    await page.close();
  }

  generateRecommendations() {
    const recommendations = [];

    // Análisis de Core Web Vitals
    const mobile = this.results.mobile;

    if (mobile.webVitals?.LCP > 2500) {
      recommendations.push({
        priority: 'ALTA',
        category: 'LCP',
        issue: `LCP móvil: ${Math.round(mobile.webVitals.LCP)}ms (>2.5s)`,
        impact: 'Core Web Vitals',
        actions: [
          'Optimizar carga de imágenes con WebP y lazy loading',
          'Implementar preconnect para recursos críticos',
          'Reducir tamaño de recursos above-the-fold'
        ]
      });
    }

    if (mobile.webVitals?.CLS > 0.1) {
      recommendations.push({
        priority: 'CRÍTICA',
        category: 'CLS',
        issue: `CLS móvil: ${mobile.webVitals.CLS.toFixed(3)} (>0.1)`,
        impact: 'Core Web Vitals',
        actions: [
          'Reservar espacio para tablas de precios dinámicas',
          'Especificar dimensiones para imágenes y ads',
          'Evitar insertar contenido dinámico above-the-fold'
        ]
      });
    }

    if (this.results.interactionAnalysis?.averageInteractionTime > 200) {
      recommendations.push({
        priority: 'CRÍTICA',
        category: 'INP',
        issue: `Tiempo promedio de interacción: ${Math.round(this.results.interactionAnalysis.averageInteractionTime)}ms (>200ms)`,
        impact: 'Interaction to Next Paint',
        actions: [
          'Implementar debouncing en event handlers',
          'Usar requestIdleCallback para tareas no críticas',
          'Optimizar manipulación DOM en checkboxes'
        ]
      });
    }

    if (this.results.jsAnalysis?.blockingScripts > 3) {
      recommendations.push({
        priority: 'MEDIA',
        category: 'JavaScript',
        issue: `${this.results.jsAnalysis.blockingScripts} scripts bloqueantes`,
        impact: 'Render Blocking',
        actions: [
          'Añadir async/defer a scripts no críticos',
          'Implementar code splitting',
          'Mover scripts al final del body'
        ]
      });
    }

    if (this.results.networkAnalysis?.thirdPartyRequests > 10) {
      recommendations.push({
        priority: 'MEDIA',
        category: 'Red',
        issue: `${this.results.networkAnalysis.thirdPartyRequests} requests de terceros`,
        impact: 'Network Performance',
        actions: [
          'Evaluar necesidad de cada script de terceros',
          'Implementar lazy loading para ads',
          'Usar resource hints (preconnect, dns-prefetch)'
        ]
      });
    }

    this.results.recommendations = recommendations;
  }

  generateComprehensiveReport() {
    console.log('\n📊 REPORTE COMPLETO DE ANÁLISIS');
    console.log('='.repeat(60));

    // Comparativa móvil vs desktop
    console.log('\n📱 MÓVIL vs 💻 DESKTOP - MÉTRICAS PRINCIPALES:');
    console.log('─'.repeat(50));

    const mobile = this.results.mobile;
    const desktop = this.results.desktop;

    if (mobile.webVitals && desktop.webVitals) {
      console.log(`LCP    | 📱 ${mobile.webVitals.LCP ? Math.round(mobile.webVitals.LCP) + 'ms' : 'N/A'} | 💻 ${desktop.webVitals.LCP ? Math.round(desktop.webVitals.LCP) + 'ms' : 'N/A'}`);
      console.log(`FCP    | 📱 ${mobile.webVitals.FCP ? Math.round(mobile.webVitals.FCP) + 'ms' : 'N/A'} | 💻 ${desktop.webVitals.FCP ? Math.round(desktop.webVitals.FCP) + 'ms' : 'N/A'}`);
      console.log(`CLS    | 📱 ${mobile.webVitals.CLS ? mobile.webVitals.CLS.toFixed(3) : 'N/A'} | 💻 ${desktop.webVitals.CLS ? desktop.webVitals.CLS.toFixed(3) : 'N/A'}`);
      console.log(`TTFB   | 📱 ${mobile.webVitals.TTFB ? Math.round(mobile.webVitals.TTFB) + 'ms' : 'N/A'} | 💻 ${desktop.webVitals.TTFB ? Math.round(desktop.webVitals.TTFB) + 'ms' : 'N/A'}`);
    }

    // Análisis de red
    console.log('\n🌐 ANÁLISIS DE RED:');
    console.log('─'.repeat(25));
    console.log(`Total requests:     ${this.results.networkAnalysis.totalRequests}`);
    console.log(`Critical path:      ${this.results.networkAnalysis.criticalPathRequests}`);
    console.log(`Imágenes:          ${this.results.networkAnalysis.imageRequests}`);
    console.log(`Third-party:       ${this.results.networkAnalysis.thirdPartyRequests}`);

    // Análisis de JavaScript
    console.log('\n📜 ANÁLISIS JAVASCRIPT:');
    console.log('─'.repeat(25));
    console.log(`Total scripts:      ${this.results.jsAnalysis.totalScripts}`);
    console.log(`Scripts bloqueantes: ${this.results.jsAnalysis.blockingScripts}`);
    console.log(`Async scripts:      ${this.results.jsAnalysis.asyncScripts}`);
    console.log(`Deferred scripts:   ${this.results.jsAnalysis.deferredScripts}`);
    console.log(`Librerías:          ${this.results.jsAnalysis.detectedLibraries.join(', ')}`);

    // Análisis de interacciones
    if (this.results.interactionAnalysis.interactions) {
      console.log('\n🖱️ ANÁLISIS DE INTERACCIONES:');
      console.log('─'.repeat(25));
      console.log(`Promedio:           ${this.results.interactionAnalysis.averageInteractionTime ? Math.round(this.results.interactionAnalysis.averageInteractionTime) + 'ms' : 'N/A'}`);
      console.log(`Más lenta:          ${this.results.interactionAnalysis.slowestInteraction ? Math.round(this.results.interactionAnalysis.slowestInteraction) + 'ms' : 'N/A'}`);
      console.log(`Event listeners:    ~${this.results.interactionAnalysis.estimatedListeners}`);
    }

    // Recomendaciones priorizadas
    console.log('\n🚀 RECOMENDACIONES PRIORIZADAS:');
    console.log('─'.repeat(40));

    this.results.recommendations
      .sort((a, b) => {
        const priorityOrder = { 'CRÍTICA': 0, 'ALTA': 1, 'MEDIA': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5)
      .forEach((rec, i) => {
        const emoji = rec.priority === 'CRÍTICA' ? '🚨' : rec.priority === 'ALTA' ? '🔴' : '🟡';
        console.log(`\n${i + 1}. ${emoji} [${rec.category}] ${rec.issue}`);
        console.log(`   💥 Impacto: ${rec.impact}`);
        rec.actions.forEach((action, j) => {
          console.log(`   ${j === 0 ? '💡' : '  '} ${action}`);
        });
      });

    console.log('\n='.repeat(60));
  }

  saveReport() {
    const fileName = `performance-analysis-complete-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Análisis completo guardado: ${fileName}`);
  }
}

// Ejecutar análisis
async function runAnalysis() {
  const analyzer = new ComprehensivePerformanceAnalysis();
  try {
    await analyzer.analyze();
  } catch (error) {
    console.error('❌ Error ejecutando análisis completo:', error);
  }
}

if (require.main === module) {
  runAnalysis();
}

module.exports = ComprehensivePerformanceAnalysis;