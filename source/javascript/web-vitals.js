// Web Vitals monitoring optimizado para medir INP y otras métricas
// Este módulo se integra con analytics-optimizer para mejor performance

/**
 * WebVitalsMonitor - Sistema avanzado de monitoreo de Web Vitals
 * Integrado con analytics-optimizer para batching inteligente
 */
class WebVitalsMonitor {
  constructor() {
    this.metrics = new Map();
    this.inpThreshold = 200;
    this.budget = {
      INP: 200,
      LCP: 2500,
      CLS: 0.1,
      FID: 100,
      FCP: 1800,
      TTFB: 600
    };
    this.samplingRate = 0.8; // 80% de usuarios reportan Web Vitals
    this.shouldSample = Math.random() < this.samplingRate;
    this.realTimeINP = [];
    this.inpWarningCount = 0;
    this.maxINPWarnings = 5;

    this.init();
  }

  init() {
    // Solo cargar en producción o con flag debug
    if (!this.shouldLoadInEnvironment()) {
      console.log('🚫 Web Vitals monitoring disabled in development');
      return;
    }

    this.loadWebVitalsLibrary();
    this.setupRealTimeINPMonitoring();
    this.setupPerformanceBudgetAlerts();
  }

  shouldLoadInEnvironment() {
    const isDev =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const hasDebug = window.location.search.includes('debug=true');

    return !isDev || hasDebug;
  }

  /**
   * Carga librería Web Vitals de forma optimizada
   */
  async loadWebVitalsLibrary() {
    try {
      // Usar requestIdleCallback para mejor INP
      const loadLibrary = () => {
        return import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js');
      };

      let webVitalsModule;
      if ('requestIdleCallback' in window) {
        webVitalsModule = await new Promise(resolve => {
          requestIdleCallback(
            async () => {
              resolve(await loadLibrary());
            },
            { timeout: 3000 }
          );
        });
      } else {
        webVitalsModule = await loadLibrary();
      }

      if (window.webVitals) {
        this.initializeMetricObservers();
        console.log('✅ Web Vitals library loaded and initialized');
      }
    } catch (error) {
      console.error('❌ Error loading Web Vitals:', error);

      // Reportar error si analytics está disponible
      if (window.analyticsOptimizer) {
        window.analyticsOptimizer.trackError(error, 'web_vitals_load');
      }
    }
  }

  /**
   * Inicializa observadores de métricas
   */
  initializeMetricObservers() {
    const { onCLS, onFID, onFCP, onINP, onLCP, onTTFB } = window.webVitals;

    // Configurar observadores con nueva función optimizada
    onCLS(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onINP(this.handleINPMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    console.log('📊 Web Vitals observers initialized');
  }

  /**
   * Maneja métricas generales con optimización
   */
  handleMetric({ name, value, rating, delta, navigationType }) {
    const metric = {
      name,
      value,
      rating,
      delta,
      navigationType,
      timestamp: Date.now(),
      url: window.location.pathname,
      connection: this.getConnectionInfo()
    };

    // Almacenar métrica
    this.metrics.set(name, metric);

    // Verificar presupuesto de rendimiento
    this.checkPerformanceBudget(metric);

    // Enviar a analytics con priorización inteligente
    this.sendMetricToAnalytics(metric);

    // Logging optimizado
    this.logMetric(metric);
  }

  /**
   * Manejo especializado para métricas INP
   */
  handleINPMetric(inpMetric) {
    // Añadir a histórico de INP
    this.realTimeINP.push({
      value: inpMetric.value,
      timestamp: Date.now(),
      target: inpMetric.target || 'unknown',
      rating: inpMetric.rating
    });

    // Mantener solo últimos 20 valores
    if (this.realTimeINP.length > 20) {
      this.realTimeINP.shift();
    }

    // Análisis en tiempo real
    this.analyzeINPTrend();

    // Procesar como métrica normal
    this.handleMetric(inpMetric);

    // Alertas críticas para INP
    if (inpMetric.value > this.inpThreshold) {
      this.handleCriticalINP(inpMetric);
    }
  }

  /**
   * Analiza tendencia de INP en tiempo real
   */
  analyzeINPTrend() {
    if (this.realTimeINP.length < 3) return;

    const recent = this.realTimeINP.slice(-5);
    const avgRecent =
      recent.reduce((sum, item) => sum + item.value, 0) / recent.length;

    // Detectar patrón de degradación
    if (avgRecent > this.inpThreshold * 1.2) {
      console.warn(
        `📈 Tendencia INP preocupante: promedio ${avgRecent.toFixed(2)}ms`
      );

      // Enviar alerta solo una vez cada 10 minutos
      const now = Date.now();
      const lastAlert = this.lastINPTrendAlert || 0;

      if (now - lastAlert > 600000) {
        // 10 minutos
        this.sendINPTrendAlert(avgRecent, recent);
        this.lastINPTrendAlert = now;
      }
    }
  }

  /**
   * Maneja INP crítico (>200ms)
   */
  handleCriticalINP(inpMetric) {
    this.inpWarningCount++;

    // Log con información detallada
    console.warn(
      `🚨 INP Crítico #${this.inpWarningCount}: ${inpMetric.value.toFixed(
        2
      )}ms`,
      {
        target: inpMetric.target,
        rating: inpMetric.rating,
        delta: inpMetric.delta,
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    );

    // Envío inmediato a analytics (alta prioridad)
    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackEvent(
        {
          event_name: 'critical_inp',
          event_category: 'performance_critical',
          value: Math.round(inpMetric.value),
          target_element: inpMetric.target || 'unknown',
          warning_count: this.inpWarningCount,
          page_path: window.location.pathname
        },
        'critical'
      );
    }

    // Sugerir optimizaciones después de múltiples warnings
    if (this.inpWarningCount >= this.maxINPWarnings) {
      this.suggestINPOptimizations();
    }
  }

  /**
   * Envía alerta de tendencia INP
   */
  sendINPTrendAlert(avgINP, recentINP) {
    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackEvent(
        {
          event_name: 'inp_trend_alert',
          event_category: 'performance_monitoring',
          value: Math.round(avgINP),
          sample_count: recentINP.length,
          trend_rating: 'poor',
          page_path: window.location.pathname
        },
        'high'
      );
    }
  }

  /**
   * Sugiere optimizaciones automáticas para INP
   */
  suggestINPOptimizations() {
    const suggestions = [
      '🔧 Usar event delegation para reducir listeners',
      '⚡ Implementar throttling en eventos de mouse/scroll',
      '📦 Dividir tareas JavaScript largas con scheduler.postTask',
      '🎯 Aplicar CSS containment a elementos complejos',
      '💾 Cachear referencias DOM para evitar re-queries'
    ];

    console.group('💡 Sugerencias automáticas para optimizar INP:');
    suggestions.forEach(suggestion => console.log(suggestion));
    console.groupEnd();

    // Enviar sugerencias a analytics
    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackEvent(
        {
          event_name: 'inp_optimization_suggestions',
          event_category: 'performance_insights',
          suggestion_count: suggestions.length,
          trigger_threshold: this.inpThreshold,
          warning_count: this.inpWarningCount
        },
        'normal'
      );
    }
  }

  /**
   * Verifica presupuesto de rendimiento
   */
  checkPerformanceBudget(metric) {
    const budget = this.budget[metric.name];
    if (!budget) return;

    const isOverBudget =
      metric.name === 'CLS' ? metric.value > budget : metric.value > budget;

    if (isOverBudget) {
      console.warn(
        `💸 Presupuesto excedido: ${metric.name} = ${metric.value.toFixed(
          2
        )} (límite: ${budget})`
      );

      // Reportar exceso de presupuesto
      if (window.analyticsOptimizer) {
        window.analyticsOptimizer.trackEvent(
          {
            event_name: 'performance_budget_exceeded',
            event_category: 'performance_monitoring',
            metric_name: metric.name,
            actual_value: Math.round(metric.value),
            budget_value: budget,
            excess_percentage: Math.round(
              ((metric.value - budget) / budget) * 100
            )
          },
          'high'
        );
      }
    }
  }

  /**
   * Envía métrica a analytics con priorización
   */
  sendMetricToAnalytics(metric) {
    // Aplicar sampling para métricas no críticas
    if (!this.shouldSample && metric.rating !== 'poor') {
      return;
    }

    // Determinar prioridad basada en rating y tipo de métrica
    let priority = 'normal';
    if (metric.name === 'INP' || metric.rating === 'poor') {
      priority = 'high';
    } else if (metric.rating === 'needs-improvement') {
      priority = 'normal';
    } else {
      priority = 'low';
    }

    // Usar analytics optimizer si está disponible
    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackPerformanceMetric(
        metric.name,
        metric.value,
        metric.rating
      );
    } else {
      // Fallback a gtag directo
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          metric_rating: metric.rating,
          metric_delta: metric.delta,
          non_interaction: true
        });
      }
    }
  }

  /**
   * Logging optimizado de métricas
   */
  logMetric(metric) {
    const emoji = this.getMetricEmoji(metric.name, metric.rating);
    const value =
      metric.name === 'CLS'
        ? (metric.value * 1000).toFixed(1) + ' (x1000)'
        : metric.value.toFixed(2);

    console.log(
      `${emoji} [Web Vitals] ${metric.name}: ${value}ms [${metric.rating}]`,
      {
        delta: metric.delta ? metric.delta.toFixed(2) : 'N/A',
        navigation: metric.navigationType,
        connection: metric.connection
      }
    );
  }

  /**
   * Obtiene emoji representativo para métrica
   */
  getMetricEmoji(name, rating) {
    const emojiMap = {
      INP:
        rating === 'good' ? '⚡' : rating === 'needs-improvement' ? '🟡' : '🔴',
      LCP:
        rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴',
      CLS:
        rating === 'good' ? '📐' : rating === 'needs-improvement' ? '🟡' : '🔴',
      FID:
        rating === 'good' ? '👆' : rating === 'needs-improvement' ? '🟡' : '🔴',
      FCP:
        rating === 'good' ? '🎨' : rating === 'needs-improvement' ? '🟡' : '🔴',
      TTFB:
        rating === 'good' ? '🚀' : rating === 'needs-improvement' ? '🟡' : '🔴'
    };

    return emojiMap[name] || '📊';
  }

  /**
   * Obtiene información de conexión
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt
      };
    }
    return { effectiveType: 'unknown' };
  }

  /**
   * Configura alertas de presupuesto de rendimiento
   */
  setupPerformanceBudgetAlerts() {
    // Monitorear Long Tasks para correlacionar con INP
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              this.handleLongTask(entry);
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long Task observer not supported');
      }
    }
  }

  /**
   * Maneja detección de Long Tasks
   */
  handleLongTask(entry) {
    // Correlacionar con INP reciente
    const recentINP = this.realTimeINP.slice(-3);
    const hasRecentHighINP = recentINP.some(
      inp => inp.value > this.inpThreshold
    );

    if (hasRecentHighINP) {
      console.warn(
        `🐌 Long Task correlacionada con INP alto: ${entry.duration.toFixed(
          2
        )}ms`
      );

      // Reportar correlación
      if (window.analyticsOptimizer) {
        window.analyticsOptimizer.trackEvent(
          {
            event_name: 'longtask_inp_correlation',
            event_category: 'performance_analysis',
            task_duration: Math.round(entry.duration),
            recent_inp_count: recentINP.length,
            avg_recent_inp: Math.round(
              recentINP.reduce((sum, inp) => sum + inp.value, 0) /
                recentINP.length
            )
          },
          'normal'
        );
      }
    }
  }

  /**
   * Configura monitoreo en tiempo real de INP
   */
  setupRealTimeINPMonitoring() {
    // Monitorear interacciones con PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        const eventObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              this.trackSlowInteraction(entry);
            }
          }
        });

        eventObserver.observe({ type: 'event', buffered: true });
      } catch (error) {
        console.warn('Event timing observer not supported');
      }
    }
  }

  /**
   * Rastrea interacciones lentas
   */
  trackSlowInteraction(entry) {
    console.warn(
      `🐢 Interacción lenta detectada: ${entry.name} - ${entry.duration.toFixed(
        2
      )}ms`
    );

    // Añadir contexto adicional
    const context = {
      interaction_type: entry.name,
      duration: entry.duration,
      start_time: entry.startTime,
      page_path: window.location.pathname,
      target: entry.target || 'unknown'
    };

    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackEvent(
        {
          event_name: 'slow_interaction_detected',
          event_category: 'performance_monitoring',
          value: Math.round(entry.duration),
          interaction_type: entry.name,
          page_path: window.location.pathname
        },
        'normal'
      );
    }
  }

  /**
   * Obtiene estadísticas actuales
   */
  getStats() {
    return {
      metrics: Object.fromEntries(this.metrics),
      inpHistory: this.realTimeINP.slice(-10),
      inpWarningCount: this.inpWarningCount,
      samplingActive: this.shouldSample,
      budget: this.budget
    };
  }

  /**
   * Reinicia contadores de warning
   */
  resetWarnings() {
    this.inpWarningCount = 0;
    this.lastINPTrendAlert = 0;
    console.log('🔄 Web Vitals warnings reset');
  }
}

// Funciones públicas para compatibilidad
export function initWebVitals() {
  if (!window.webVitalsMonitor) {
    window.webVitalsMonitor = new WebVitalsMonitor();
  }
  return window.webVitalsMonitor;
}

// Función para medir interacciones específicas (mantiene compatibilidad)
export function measureInteraction(interactionName) {
  const startTime = performance.now();

  return {
    end: () => {
      const duration = performance.now() - startTime;

      // Log si la interacción toma más de 50ms
      if (duration > 50) {
        console.warn(
          `⚠️ Interacción lenta: ${interactionName} tomó ${duration.toFixed(
            2
          )}ms`
        );
      }

      // Usar analytics optimizer si está disponible
      if (window.analyticsOptimizer) {
        window.analyticsOptimizer.trackEvent(
          {
            event_name: 'interaction_timing',
            event_category: 'performance',
            interaction_name: interactionName,
            value: Math.round(duration),
            non_interaction: true
          },
          duration > 100 ? 'normal' : 'low'
        );
      } else if (window.gtag) {
        // Fallback a gtag directo
        window.gtag('event', 'interaction_timing', {
          interaction_name: interactionName,
          value: Math.round(duration),
          non_interaction: true
        });
      }

      return duration;
    }
  };
}

// Auto-inicializar cuando el documento esté listo (optimizado para INP)
if (document.readyState === 'complete') {
  // Usar requestIdleCallback para mejor INP
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initWebVitals(), { timeout: 2000 });
  } else {
    setTimeout(initWebVitals, 0);
  }
} else {
  window.addEventListener(
    'load',
    () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initWebVitals(), { timeout: 3000 });
      } else {
        setTimeout(initWebVitals, 100);
      }
    },
    { once: true }
  );
}
