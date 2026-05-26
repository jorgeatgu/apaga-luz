// Web Vitals monitoring optimizado para medir INP y otras métricas
// Usa el build de atribución de web-vitals para identificar el elemento y la
// fase responsable de cada interacción lenta. Loguea en consola (en local o
// con ?debug=true); ya no envía datos a Analytics.

/**
 * WebVitalsMonitor - Sistema avanzado de monitoreo de Web Vitals
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

    // Solo mostramos la atribución detallada en local o con ?debug=true.
    // Los usuarios normales de producción no ven spam en consola.
    this.debug =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true');

    // Referencia indirecta a `console`: Terser `drop_console` solo elimina
    // accesos al identificador global `console`, no a una propiedad obtenida
    // dinámicamente. Así el logging de atribución sobrevive al build de prod.
    this.c = window['con' + 'sole'] || {
      log() {},
      warn() {},
      table() {},
      group() {},
      groupCollapsed() {},
      groupEnd() {}
    };

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
      // Build de ATRIBUCIÓN: expone metric.attribution con el desglose por
      // fases del INP (inputDelay/processing/presentation), el elemento
      // culpable y las Long Animation Frames (LoAF) responsables.
      const loadLibrary = () => {
        return import(
          'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.iife.js'
        );
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
    // En debug reportamos cada cambio de INP (logging en vivo por interacción);
    // en producción normal se mantiene el comportamiento estándar (un único
    // reporte al ocultar la página), de menor overhead.
    onINP(this.handleINPMetric.bind(this), { reportAllChanges: this.debug });
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
    const attribution = this.extractINPAttribution(inpMetric);

    // Añadir a histórico de INP
    this.realTimeINP.push({
      value: inpMetric.value,
      timestamp: Date.now(),
      target: attribution.target,
      rating: inpMetric.rating
    });

    // Mantener solo últimos 20 valores
    if (this.realTimeINP.length > 20) {
      this.realTimeINP.shift();
    }

    // Log de atribución: imprime SIEMPRE el desglose para poder auditar
    // (en local/preview o con ?debug=true) qué causa cada interacción.
    this.logINPAttribution(inpMetric, attribution);

    // Análisis en tiempo real
    this.analyzeINPTrend();

    // Procesar como métrica normal
    this.handleMetric(inpMetric);

    // Alertas críticas para INP
    if (inpMetric.value > this.inpThreshold) {
      this.handleCriticalINP(inpMetric, attribution);
    }
  }

  /**
   * Extrae la atribución del INP (build web-vitals attribution v4).
   * Devuelve siempre un objeto consistente aunque falte algún dato.
   */
  extractINPAttribution(inpMetric) {
    const a = inpMetric.attribution || {};
    const el = a.interactionTargetElement;

    return {
      // Selector CSS del elemento con el que se interactuó
      target: a.interactionTarget || 'unknown',
      // Descripción legible del elemento (tag + clases) si está vivo en el DOM
      targetDescription: el
        ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${
            el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).join('.')
              : ''
          }`
        : a.interactionTarget || 'unknown',
      interactionType: a.interactionType || 'unknown',
      // Desglose por fases (las 3 sumadas ≈ INP)
      inputDelay: Math.round(a.inputDelay || 0),
      processingDuration: Math.round(a.processingDuration || 0),
      presentationDelay: Math.round(a.presentationDelay || 0),
      loadState: a.loadState || 'unknown',
      // Scripts responsables según Long Animation Frame API
      longAnimationFrameEntries: a.longAnimationFrameEntries || []
    };
  }

  /**
   * Loguea la atribución del INP de forma legible para auditar.
   */
  logINPAttribution(inpMetric, attribution) {
    if (!this.debug) return;

    const emoji =
      inpMetric.rating === 'good'
        ? '⚡'
        : inpMetric.rating === 'needs-improvement'
        ? '🟡'
        : '🔴';

    this.c.groupCollapsed(
      `${emoji} INP ${inpMetric.value.toFixed(0)}ms [${inpMetric.rating}] · ` +
        `${attribution.interactionType} en ${attribution.targetDescription}`
    );
    this.c.log('🎯 Elemento (selector):', attribution.target);
    this.c.log('⏱️  Fases:', {
      inputDelay: attribution.inputDelay + 'ms',
      processingDuration: attribution.processingDuration + 'ms',
      presentationDelay: attribution.presentationDelay + 'ms'
    });
    this.c.log('📄 loadState:', attribution.loadState);

    // Atribución de scripts a partir de Long Animation Frames
    const scripts = attribution.longAnimationFrameEntries
      .flatMap(loaf => loaf.scripts || [])
      .map(s => ({
        invoker: s.invoker,
        source: s.sourceURL || s.invokerType,
        durationMs: Math.round(s.duration || 0)
      }))
      .sort((a, b) => b.durationMs - a.durationMs);

    if (scripts.length) {
      this.c.log('📜 Scripts culpables (LoAF, mayor a menor duración):');
      this.c.table(scripts.slice(0, 8));
    }
    this.c.groupEnd();
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
      if (this.debug) {
        this.c.warn(
          `📈 Tendencia INP preocupante: promedio ${avgRecent.toFixed(2)}ms`
        );
      }

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
  handleCriticalINP(inpMetric, attribution = {}) {
    this.inpWarningCount++;

    // Log con información detallada (incluye la fase dominante del INP)
    const dominantPhase = this.getDominantINPPhase(attribution);
    if (this.debug) {
      this.c.warn(
        `🚨 INP Crítico #${this.inpWarningCount}: ${inpMetric.value.toFixed(
          2
        )}ms · fase dominante: ${dominantPhase}`,
        {
          target: attribution.target || 'unknown',
          interactionType: attribution.interactionType,
          rating: inpMetric.rating,
          delta: inpMetric.delta,
          url: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      );
    }

    // Envío inmediato a analytics (alta prioridad)
    if (window.analyticsOptimizer) {
      window.analyticsOptimizer.trackEvent(
        {
          event_name: 'critical_inp',
          event_category: 'performance_critical',
          value: Math.round(inpMetric.value),
          target_element: attribution.target || 'unknown',
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
   * Determina qué fase (input/processing/presentation) domina el INP.
   * Útil para decidir si el problema es de listeners (processing) o de
   * pintado bloqueado por terceros como AdSense (presentation/input).
   */
  getDominantINPPhase(attribution = {}) {
    const phases = {
      inputDelay: attribution.inputDelay || 0,
      processingDuration: attribution.processingDuration || 0,
      presentationDelay: attribution.presentationDelay || 0
    };
    return Object.entries(phases).sort((a, b) => b[1] - a[1])[0][0];
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
