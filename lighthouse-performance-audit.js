// Lighthouse Performance Audit para Apaga Luz
// Análisis completo incluyendo INP, Core Web Vitals y oportunidades específicas

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');

class LighthouseAudit {
  constructor() {
    this.url = 'http://localhost:8001';
    this.results = {};
  }

  async runAudit() {
    console.log('🏮 Iniciando auditoría Lighthouse para Apaga Luz...\n');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Configuración de Lighthouse optimizada
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: new URL(browser.wsEndpoint()).port,
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675
        },
        settings: {
          emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Mobile Safari/537.36'
        }
      };

      console.log('📱 Ejecutando auditoría móvil...');
      const mobileResult = await lighthouse(this.url, options);

      // Cambiar a desktop
      options.formFactor = 'desktop';
      options.throttling = {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      };

      console.log('💻 Ejecutando auditoría desktop...');
      const desktopResult = await lighthouse(this.url, options);

      await browser.close();

      // Procesar resultados
      this.processResults(mobileResult.lhr, desktopResult.lhr);
      this.generateDetailedReport();

      return this.results;
    } catch (error) {
      console.error('❌ Error en auditoría Lighthouse:', error);
      await browser.close();
    }
  }

  processResults(mobileReport, desktopReport) {
    console.log('📊 Procesando resultados...\n');

    this.results = {
      timestamp: new Date().toISOString(),
      url: this.url,
      mobile: this.extractMetrics(mobileReport, 'mobile'),
      desktop: this.extractMetrics(desktopReport, 'desktop'),
      opportunities: this.extractOpportunities(mobileReport),
      diagnostics: this.extractDiagnostics(mobileReport),
      recommendations: []
    };

    // Generar recomendaciones específicas
    this.generateRecommendations();
  }

  extractMetrics(report, device) {
    const metrics = report.audits;

    return {
      score: Math.round(report.categories.performance.score * 100),
      coreWebVitals: {
        LCP: {
          value: Math.round(metrics['largest-contentful-paint'].numericValue),
          score: Math.round(metrics['largest-contentful-paint'].score * 100),
          rating: this.getWebVitalRating(metrics['largest-contentful-paint'].numericValue, [2500, 4000])
        },
        FID: {
          value: Math.round(metrics['max-potential-fid']?.numericValue || 0),
          score: Math.round(metrics['max-potential-fid']?.score * 100 || 0),
          rating: this.getWebVitalRating(metrics['max-potential-fid']?.numericValue || 0, [100, 300])
        },
        CLS: {
          value: Math.round(metrics['cumulative-layout-shift'].numericValue * 1000) / 1000,
          score: Math.round(metrics['cumulative-layout-shift'].score * 100),
          rating: this.getWebVitalRating(metrics['cumulative-layout-shift'].numericValue, [0.1, 0.25])
        },
        FCP: {
          value: Math.round(metrics['first-contentful-paint'].numericValue),
          score: Math.round(metrics['first-contentful-paint'].score * 100),
          rating: this.getWebVitalRating(metrics['first-contentful-paint'].numericValue, [1800, 3000])
        },
        TTI: {
          value: Math.round(metrics['interactive'].numericValue),
          score: Math.round(metrics['interactive'].score * 100),
          rating: this.getWebVitalRating(metrics['interactive'].numericValue, [3800, 7300])
        },
        TBT: {
          value: Math.round(metrics['total-blocking-time'].numericValue),
          score: Math.round(metrics['total-blocking-time'].score * 100),
          rating: this.getWebVitalRating(metrics['total-blocking-time'].numericValue, [200, 600])
        },
        SpeedIndex: {
          value: Math.round(metrics['speed-index'].numericValue),
          score: Math.round(metrics['speed-index'].score * 100),
          rating: this.getWebVitalRating(metrics['speed-index'].numericValue, [3400, 5800])
        }
      },
      loadingMetrics: {
        TTFB: Math.round(metrics['server-response-time']?.numericValue || 0),
        resources: this.extractResourceMetrics(metrics),
        networkRequests: metrics['network-requests']?.details?.items?.length || 0
      }
    };
  }

  extractResourceMetrics(metrics) {
    const requests = metrics['network-requests']?.details?.items || [];

    return {
      totalSize: Math.round(requests.reduce((sum, req) => sum + (req.transferSize || 0), 0) / 1024),
      scriptSize: Math.round(requests
        .filter(req => req.resourceType === 'Script')
        .reduce((sum, req) => sum + (req.transferSize || 0), 0) / 1024),
      styleSize: Math.round(requests
        .filter(req => req.resourceType === 'Stylesheet')
        .reduce((sum, req) => sum + (req.transferSize || 0), 0) / 1024),
      imageSize: Math.round(requests
        .filter(req => req.resourceType === 'Image')
        .reduce((sum, req) => sum + (req.transferSize || 0), 0) / 1024),
      fontSize: Math.round(requests
        .filter(req => req.resourceType === 'Font')
        .reduce((sum, req) => sum + (req.transferSize || 0), 0) / 1024)
    };
  }

  extractOpportunities(report) {
    const opportunities = [];
    const audits = report.audits;

    // Oportunidades principales para Core Web Vitals
    const keyOpportunities = [
      'unused-javascript',
      'unused-css-rules',
      'render-blocking-resources',
      'offscreen-images',
      'efficient-animated-content',
      'modern-image-formats',
      'legacy-javascript',
      'serves-responsive-images',
      'uses-optimized-images',
      'dom-size',
      'mainthread-work-breakdown',
      'bootup-time'
    ];

    keyOpportunities.forEach(auditId => {
      if (audits[auditId] && audits[auditId].score < 1) {
        opportunities.push({
          audit: auditId,
          title: audits[auditId].title,
          description: audits[auditId].description,
          score: Math.round(audits[auditId].score * 100),
          savings: Math.round(audits[auditId].numericValue || 0),
          impact: this.getImpactLevel(audits[auditId].score)
        });
      }
    });

    return opportunities.sort((a, b) => a.score - b.score);
  }

  extractDiagnostics(report) {
    const diagnostics = [];
    const audits = report.audits;

    const keyDiagnostics = [
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
      'third-party-summary',
      'largest-contentful-paint-element',
      'layout-shift-elements',
      'long-tasks',
      'non-composited-animations',
      'unsized-images'
    ];

    keyDiagnostics.forEach(auditId => {
      if (audits[auditId]) {
        diagnostics.push({
          audit: auditId,
          title: audits[auditId].title,
          description: audits[auditId].description,
          score: Math.round(audits[auditId].score * 100),
          passed: audits[auditId].score === 1,
          details: this.extractAuditDetails(audits[auditId])
        });
      }
    });

    return diagnostics;
  }

  extractAuditDetails(audit) {
    if (audit.details && audit.details.items) {
      return audit.details.items.slice(0, 3); // Top 3 items
    }
    return null;
  }

  getWebVitalRating(value, thresholds) {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  }

  getImpactLevel(score) {
    if (score < 0.5) return 'high';
    if (score < 0.8) return 'medium';
    return 'low';
  }

  generateRecommendations() {
    const recommendations = [];

    // Análisis de Core Web Vitals móvil
    const mobile = this.results.mobile;

    // LCP recommendations
    if (mobile.coreWebVitals.LCP.rating !== 'good') {
      recommendations.push({
        priority: 'alta',
        metric: 'LCP',
        current: `${mobile.coreWebVitals.LCP.value}ms`,
        target: '<2.5s',
        actions: [
          'Optimizar imágenes hero con WebP y lazy loading',
          'Implementar preload para recursos críticos',
          'Reducir bloqueo de render CSS/JS',
          'Mejorar tiempo de respuesta del servidor'
        ]
      });
    }

    // CLS recommendations
    if (mobile.coreWebVitals.CLS.rating !== 'good') {
      recommendations.push({
        priority: 'alta',
        metric: 'CLS',
        current: mobile.coreWebVitals.CLS.value,
        target: '<0.1',
        actions: [
          'Reservar espacio para elementos dinámicos (tablas de precios)',
          'Especificar dimensiones para imágenes',
          'Evitar insertar contenido sobre contenido existente',
          'Usar CSS containment para aislar cambios de layout'
        ]
      });
    }

    // TBT/INP recommendations (critical for interaction responsiveness)
    if (mobile.coreWebVitals.TBT.rating !== 'good') {
      recommendations.push({
        priority: 'crítica',
        metric: 'TBT/INP',
        current: `${mobile.coreWebVitals.TBT.value}ms`,
        target: '<200ms',
        actions: [
          'Implementar code splitting para JavaScript',
          'Optimizar event handlers con debouncing',
          'Usar requestIdleCallback para tareas no críticas',
          'Dividir long tasks con scheduler.postTask()',
          'Reducir trabajo en main thread durante interacciones'
        ]
      });
    }

    // JavaScript optimization
    const jsOpportunity = this.results.opportunities.find(op =>
      op.audit === 'unused-javascript' || op.audit === 'bootup-time'
    );

    if (jsOpportunity) {
      recommendations.push({
        priority: 'media',
        metric: 'JavaScript',
        current: `${this.results.mobile.loadingMetrics.resources.scriptSize}KB`,
        target: '<150KB',
        actions: [
          'Eliminar JavaScript no utilizado',
          'Implementar tree shaking',
          'Usar dynamic imports para código no crítico',
          'Comprimir con Terser/Esbuild'
        ]
      });
    }

    this.results.recommendations = recommendations;
  }

  generateDetailedReport() {
    console.log('📋 REPORTE COMPLETO DE PERFORMANCE - APAGA LUZ');
    console.log('='.repeat(60));
    console.log(`📅 Fecha: ${new Date(this.results.timestamp).toLocaleString()}`);
    console.log(`🌐 URL: ${this.results.url}\n`);

    // Scores generales
    console.log('📊 PUNTUACIONES LIGHTHOUSE:');
    console.log('─'.repeat(30));
    console.log(`📱 Móvil:   ${this.results.mobile.score}/100 ${this.getScoreEmoji(this.results.mobile.score)}`);
    console.log(`💻 Desktop: ${this.results.desktop.score}/100 ${this.getScoreEmoji(this.results.desktop.score)}\n`);

    // Core Web Vitals comparison
    console.log('🎯 CORE WEB VITALS MÓVIL vs DESKTOP:');
    console.log('─'.repeat(50));

    const metrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTI', 'TBT'];
    metrics.forEach(metric => {
      const mobile = this.results.mobile.coreWebVitals[metric];
      const desktop = this.results.desktop.coreWebVitals[metric];

      console.log(`${metric.padEnd(4)} | 📱 ${String(mobile.value + (metric === 'CLS' ? '' : 'ms')).padEnd(8)} ${this.getRatingEmoji(mobile.rating)} | 💻 ${String(desktop.value + (metric === 'CLS' ? '' : 'ms')).padEnd(8)} ${this.getRatingEmoji(desktop.rating)}`);
    });

    // Recursos y red
    console.log('\n📦 ANÁLISIS DE RECURSOS (MÓVIL):');
    console.log('─'.repeat(30));
    const resources = this.results.mobile.loadingMetrics.resources;
    console.log(`Total:      ${resources.totalSize}KB`);
    console.log(`JavaScript: ${resources.scriptSize}KB`);
    console.log(`CSS:        ${resources.styleSize}KB`);
    console.log(`Imágenes:   ${resources.imageSize}KB`);
    console.log(`Fuentes:    ${resources.fontSize}KB`);
    console.log(`Requests:   ${this.results.mobile.loadingMetrics.networkRequests}`);

    // Top oportunidades
    console.log('\n💡 OPORTUNIDADES PRINCIPALES:');
    console.log('─'.repeat(40));
    this.results.opportunities
      .filter(op => op.impact === 'high' || op.impact === 'medium')
      .slice(0, 5)
      .forEach((opp, i) => {
        const impact = opp.impact === 'high' ? '🔴' : '🟡';
        console.log(`${i + 1}. ${impact} ${opp.title}`);
        console.log(`   💾 Ahorro potencial: ${opp.savings}ms`);
        console.log(`   📊 Score: ${opp.score}/100\n`);
      });

    // Recomendaciones priorizadas
    console.log('🚀 PLAN DE ACCIÓN PRIORIZADO:');
    console.log('─'.repeat(40));
    this.results.recommendations
      .sort((a, b) => a.priority === 'crítica' ? -1 : a.priority === 'alta' ? 0 : 1)
      .slice(0, 3)
      .forEach((rec, i) => {
        const priority = rec.priority === 'crítica' ? '🚨' : rec.priority === 'alta' ? '🔴' : '🟡';
        console.log(`${i + 1}. ${priority} [${rec.metric}] ${rec.current} → ${rec.target}`);
        rec.actions.forEach((action, j) => {
          console.log(`   ${j === 0 ? '💡' : '  '} ${action}`);
        });
        console.log();
      });

    // Diagnósticos críticos
    const criticalDiagnostics = this.results.diagnostics.filter(d => !d.passed && d.score < 80);
    if (criticalDiagnostics.length > 0) {
      console.log('⚠️  DIAGNÓSTICOS CRÍTICOS:');
      console.log('─'.repeat(30));
      criticalDiagnostics.slice(0, 3).forEach(diag => {
        console.log(`❌ ${diag.title} (${diag.score}/100)`);
      });
      console.log();
    }

    console.log('🎯 OBJETIVOS DE PERFORMANCE:');
    console.log('─'.repeat(30));
    console.log('✅ LCP: <2.5s (Good) | <4s (Needs Improvement)');
    console.log('✅ FID/INP: <100ms (Good) | <300ms (Needs Improvement)');
    console.log('✅ CLS: <0.1 (Good) | <0.25 (Needs Improvement)');
    console.log('✅ Score Lighthouse: >90 (Good) | >50 (Fair)');

    console.log('\n='.repeat(60));

    // Guardar reporte JSON detallado
    const fileName = `lighthouse-audit-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(this.results, null, 2));
    console.log(`💾 Reporte detallado guardado: ${fileName}`);
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  }

  getRatingEmoji(rating) {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  }
}

// Ejecutar auditoría
async function runLighthouseAudit() {
  const audit = new LighthouseAudit();
  try {
    await audit.runAudit();
  } catch (error) {
    console.error('❌ Error ejecutando auditoría:', error);
  }
}

if (require.main === module) {
  runLighthouseAudit();
}

module.exports = LighthouseAudit;