// analytics-optimizer.js - Optimización de Google Analytics para mejorar INP
// Este módulo gestiona events batching, lazy loading y monitoreo de performance

/**
 * AnalyticsOptimizer - Gestor centralizado de eventos analytics con optimización de rendimiento
 * Implementa batching de eventos, detección de idle time y gestión inteligente de métricas
 */
class AnalyticsOptimizer {
  constructor() {
    this.eventQueue = [];
    this.metricQueue = [];
    this.isOnline = navigator.onLine;
    this.isAnalyticsReady = false;
    this.batchSize = 10;
    this.batchTimeout = 1000; // 1 segundo
    this.idleTimeout = 2000; // 2 segundos
    this.samplingRate = 0.5; // 50% de usuarios envían todas las métricas
    this.shouldSample = Math.random() < this.samplingRate;
    this.persistenceKey = 'analytics_offline_queue';

    // Configuración de prioridades
    this.eventPriorities = {
      critical: { timeout: 100, persistent: true },
      high: { timeout: 500, persistent: true },
      normal: { timeout: 1000, persistent: false },
      low: { timeout: 5000, persistent: false }
    };

    // Estado del sistema
    this.stats = {
      eventsSent: 0,
      eventsQueued: 0,
      batchesSent: 0,
      errors: 0,
      lastActivity: Date.now()
    };

    this.init();
  }

  /**
   * Inicialización del optimizer
   */
  init() {
    this.setupConnectivityHandling();
    this.setupIdleDetection();
    this.loadPersistedQueue();
    this.detectAnalyticsAvailability();
    this.startBatchProcessor();
    this.setupVisibilityHandling();
    this.enableDebugMode();
  }

  /**
   * Detecta si Google Analytics está disponible y listo
   */
  detectAnalyticsAvailability() {
    const checkAnalytics = () => {
      if (window.gtag && window.dataLayer) {
        this.isAnalyticsReady = true;
        console.log('✅ Analytics optimizer: gtag detectado y listo');

        // Procesar eventos en cola si hay
        this.processQueuedEvents();
      } else {
        // Reintentar hasta que esté disponible
        setTimeout(checkAnalytics, 100);
      }
    };

    checkAnalytics();
  }

  /**
   * Configura manejo de conectividad online/offline
   */
  setupConnectivityHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('📶 Conectividad restaurada - procesando cola offline');
      this.processQueuedEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Sin conectividad - eventos se guardarán offline');
    });
  }

  /**
   * Configura detección de tiempo idle para envío optimizado
   */
  setupIdleDetection() {
    let idleTimer = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        this.sendIdleEvents();
      }, this.idleTimeout);
    };

    // Escuchar eventos de usuario para detectar idle
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      event => {
        document.addEventListener(event, resetIdleTimer, {
          passive: true,
          capture: true
        });
      }
    );

    // Iniciar timer
    resetIdleTimer();
  }

  /**
   * Configura manejo de visibilidad de página
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Página oculta: enviar eventos pendientes inmediatamente
        this.flushQueue('page_hidden');
      } else {
        // Página visible: reanudar procesamiento normal
        this.stats.lastActivity = Date.now();
      }
    });

    // Enviar eventos antes de que la página se cierre
    window.addEventListener(
      'beforeunload',
      () => {
        this.flushQueue('page_unload');
      },
      { once: true }
    );
  }

  /**
   * Habilita modo debug en development
   */
  enableDebugMode() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true')
    ) {
      this.debugMode = true;

      // Hacer disponible globalmente para debugging
      window.analyticsOptimizer = this;

      console.log('🐛 Analytics Optimizer: Debug mode activado');
      console.log('Usa window.analyticsOptimizer para inspeccionar el estado');
    }
  }

  /**
   * Envía un evento a la cola con priorización
   */
  trackEvent(eventData, priority = 'normal') {
    const event = {
      ...eventData,
      priority,
      timestamp: Date.now(),
      id: this.generateEventId(),
      retryCount: 0
    };

    this.stats.eventsQueued++;

    // Validar datos del evento
    if (!this.validateEvent(event)) {
      console.warn('❌ Evento inválido rechazado:', event);
      return false;
    }

    // Aplicar sampling para eventos no críticos
    if (priority !== 'critical' && priority !== 'high' && !this.shouldSample) {
      if (this.debugMode) {
        console.log('🎲 Evento omitido por sampling:', event);
      }
      return false;
    }

    // Añadir a la cola apropiada
    if (this.isMetricEvent(event)) {
      this.metricQueue.push(event);
    } else {
      this.eventQueue.push(event);
    }

    // Procesar inmediatamente si es crítico
    if (priority === 'critical') {
      this.processCriticalEvent(event);
    }

    if (this.debugMode) {
      console.log(`📊 Evento añadido a cola [${priority}]:`, event);
    }

    return true;
  }

  /**
   * Procesa evento crítico inmediatamente
   */
  processCriticalEvent(event) {
    if (this.isAnalyticsReady && this.isOnline) {
      this.sendSingleEvent(event);
    } else {
      // Persistir evento crítico para envío posterior
      this.persistEvent(event);
    }
  }

  /**
   * Valida estructura del evento
   */
  validateEvent(event) {
    // Validaciones básicas
    if (!event.action && !event.event_name) {
      return false;
    }

    // Validar tamaño de payload
    const eventStr = JSON.stringify(event);
    if (eventStr.length > 8192) {
      // 8KB limit
      console.warn('⚠️ Evento excede tamaño máximo:', eventStr.length);
      return false;
    }

    return true;
  }

  /**
   * Determina si un evento es una métrica de performance
   */
  isMetricEvent(event) {
    const metricNames = [
      'CLS',
      'FID',
      'FCP',
      'INP',
      'LCP',
      'TTFB',
      'interaction_timing'
    ];
    return metricNames.some(
      metric =>
        event.event_name === metric ||
        event.action === metric ||
        event.metric_name === metric
    );
  }

  /**
   * Genera ID único para evento
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicia procesador de lotes en background
   */
  startBatchProcessor() {
    const processBatch = async () => {
      try {
        await this.processBatches();
      } catch (error) {
        console.error('Error procesando batch:', error);
        this.stats.errors++;
      } finally {
        // Programar siguiente procesamiento
        if ('requestIdleCallback' in window) {
          requestIdleCallback(
            () => {
              setTimeout(processBatch, this.batchTimeout);
            },
            { timeout: this.batchTimeout + 1000 }
          );
        } else {
          setTimeout(processBatch, this.batchTimeout);
        }
      }
    };

    // Iniciar procesamiento
    processBatch();
  }

  /**
   * Procesa lotes de eventos de forma optimizada
   */
  async processBatches() {
    if (!this.isAnalyticsReady || !this.isOnline) {
      return;
    }

    // Procesar eventos normales
    if (this.eventQueue.length > 0) {
      await this.sendEventBatch(this.eventQueue.splice(0, this.batchSize));
    }

    // Procesar métricas por separado
    if (this.metricQueue.length > 0) {
      await this.sendMetricBatch(this.metricQueue.splice(0, this.batchSize));
    }
  }

  /**
   * Envía lote de eventos usando requestIdleCallback
   */
  async sendEventBatch(events) {
    if (events.length === 0) return;

    return new Promise(resolve => {
      const sendBatch = () => {
        try {
          // Agrupar eventos similares para reducir llamadas
          const groupedEvents = this.groupSimilarEvents(events);

          groupedEvents.forEach(eventGroup => {
            this.sendEventGroup(eventGroup);
          });

          this.stats.batchesSent++;
          this.stats.eventsSent += events.length;

          if (this.debugMode) {
            console.log(`📦 Batch enviado: ${events.length} eventos`);
          }
        } catch (error) {
          console.error('Error enviando batch:', error);
          this.stats.errors++;

          // Re-encolar eventos fallidos para reintento
          this.requeueEvents(events);
        } finally {
          resolve();
        }
      };

      // Usar idle callback para mejor INP
      if ('requestIdleCallback' in window) {
        requestIdleCallback(sendBatch, { timeout: 2000 });
      } else {
        setTimeout(sendBatch, 0);
      }
    });
  }

  /**
   * Agrupa eventos similares para batching eficiente
   */
  groupSimilarEvents(events) {
    const groups = new Map();

    events.forEach(event => {
      const key = `${event.action || event.event_name}_${event.priority}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(event);
    });

    return Array.from(groups.values());
  }

  /**
   * Envía grupo de eventos similares
   */
  sendEventGroup(eventGroup) {
    if (!eventGroup || eventGroup.length === 0) return;

    const baseEvent = eventGroup[0];

    try {
      if (eventGroup.length === 1) {
        // Evento individual
        this.sendSingleEvent(baseEvent);
      } else {
        // Lote de eventos similares
        window.gtag('event', baseEvent.action || baseEvent.event_name, {
          ...baseEvent,
          event_count: eventGroup.length,
          batch_id: this.generateEventId(),
          non_interaction: true
        });
      }
    } catch (error) {
      console.error('Error enviando grupo de eventos:', error);
      throw error;
    }
  }

  /**
   * Envía evento individual
   */
  sendSingleEvent(event) {
    try {
      const { id, timestamp, priority, retryCount, ...eventData } = event;

      window.gtag('event', event.action || event.event_name, {
        ...eventData,
        send_timestamp: timestamp,
        optimizer_version: '1.0.0'
      });

      if (this.debugMode) {
        console.log('📤 Evento enviado:', event);
      }
    } catch (error) {
      console.error('Error enviando evento individual:', error);
      throw error;
    }
  }

  /**
   * Envía lote de métricas de performance
   */
  async sendMetricBatch(metrics) {
    if (metrics.length === 0) return;

    // Agrupar métricas por tipo
    const metricsByType = metrics.reduce((acc, metric) => {
      const type = metric.event_name || metric.metric_name || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(metric);
      return acc;
    }, {});

    // Enviar cada tipo por separado
    for (const [metricType, metricList] of Object.entries(metricsByType)) {
      try {
        await this.sendMetricGroup(metricType, metricList);
      } catch (error) {
        console.error(`Error enviando métricas ${metricType}:`, error);
      }
    }
  }

  /**
   * Envía grupo de métricas del mismo tipo
   */
  async sendMetricGroup(metricType, metrics) {
    if (metrics.length === 1) {
      this.sendSingleEvent(metrics[0]);
    } else {
      // Calcular estadísticas del grupo
      const values = metrics.map(m => m.value || m.metric_value || 0);
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

      window.gtag('event', metricType, {
        value: Math.round(avgValue),
        sample_count: metrics.length,
        min_value: Math.min(...values),
        max_value: Math.max(...values),
        metric_batch: true,
        non_interaction: true
      });
    }
  }

  /**
   * Envía eventos durante tiempo idle
   */
  sendIdleEvents() {
    if (this.eventQueue.length === 0 && this.metricQueue.length === 0) {
      return;
    }

    if (this.debugMode) {
      console.log('⏰ Enviando eventos durante idle time');
    }

    // Procesar eventos de baja prioridad durante idle
    const lowPriorityEvents = this.eventQueue.filter(e => e.priority === 'low');
    if (lowPriorityEvents.length > 0) {
      this.sendEventBatch(lowPriorityEvents);
      this.eventQueue = this.eventQueue.filter(e => e.priority !== 'low');
    }
  }

  /**
   * Fuerza el envío de todos los eventos en cola
   */
  flushQueue(reason = 'manual') {
    if (this.debugMode) {
      console.log(`🚰 Flushing queue - razón: ${reason}`);
    }

    const allEvents = [...this.eventQueue, ...this.metricQueue];
    this.eventQueue = [];
    this.metricQueue = [];

    if (allEvents.length > 0) {
      // Enviar de forma síncrona si es posible
      try {
        allEvents.forEach(event => {
          this.sendSingleEvent(event);
        });
      } catch (error) {
        console.error('Error en flush:', error);
        // Persistir eventos fallidos
        this.persistEvents(allEvents);
      }
    }
  }

  /**
   * Re-encola eventos fallidos para reintento
   */
  requeueEvents(events) {
    events.forEach(event => {
      if (event.retryCount < 3) {
        event.retryCount++;
        this.eventQueue.push(event);
      } else {
        // Persistir eventos que han fallado múltiples veces
        this.persistEvent(event);
      }
    });
  }

  /**
   * Persiste evento en localStorage para envío posterior
   */
  persistEvent(event) {
    if (!event.priority || event.priority === 'low') {
      return; // No persistir eventos de baja prioridad
    }

    try {
      const persistedQueue = this.getPersistedQueue();
      persistedQueue.push(event);

      // Limitar tamaño de la cola persistida
      if (persistedQueue.length > 50) {
        persistedQueue.splice(0, persistedQueue.length - 50);
      }

      localStorage.setItem(this.persistenceKey, JSON.stringify(persistedQueue));
    } catch (error) {
      console.warn('No se pudo persistir evento:', error);
    }
  }

  /**
   * Persiste múltiples eventos
   */
  persistEvents(events) {
    events.forEach(event => this.persistEvent(event));
  }

  /**
   * Carga cola persistida desde localStorage
   */
  loadPersistedQueue() {
    try {
      const persistedQueue = this.getPersistedQueue();
      if (persistedQueue.length > 0) {
        console.log(`📥 Cargando ${persistedQueue.length} eventos persistidos`);
        this.eventQueue.push(...persistedQueue);
        localStorage.removeItem(this.persistenceKey);
      }
    } catch (error) {
      console.warn('Error cargando cola persistida:', error);
    }
  }

  /**
   * Obtiene cola persistida desde localStorage
   */
  getPersistedQueue() {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Procesa eventos que estaban en cola
   */
  processQueuedEvents() {
    if (!this.isAnalyticsReady || !this.isOnline) {
      return;
    }

    const totalEvents = this.eventQueue.length + this.metricQueue.length;
    if (totalEvents > 0) {
      console.log(`🚀 Procesando ${totalEvents} eventos en cola`);
      this.processBatches();
    }
  }

  /**
   * Helpers públicos para tracking común
   */

  trackPageView(page) {
    this.trackEvent(
      {
        event_name: 'page_view',
        page_title: document.title,
        page_location: window.location.href,
        page_path: page || window.location.pathname
      },
      'high'
    );
  }

  trackClick(element, label) {
    this.trackEvent(
      {
        event_name: 'click',
        event_category: 'engagement',
        event_label: label || element.textContent || element.id,
        element_tag: element.tagName.toLowerCase()
      },
      'normal'
    );
  }

  trackFormSubmission(formId, success = true) {
    this.trackEvent(
      {
        event_name: success ? 'form_submit' : 'form_error',
        event_category: 'forms',
        form_id: formId,
        success: success
      },
      'high'
    );
  }

  trackPerformanceMetric(metricName, value, rating = 'neutral') {
    this.trackEvent(
      {
        event_name: metricName,
        value: Math.round(value),
        metric_rating: rating,
        timestamp: Date.now()
      },
      metricName === 'INP' ? 'critical' : 'normal'
    );
  }

  trackError(error, context = 'unknown') {
    this.trackEvent(
      {
        event_name: 'javascript_error',
        event_category: 'errors',
        error_message: error.message || error,
        error_context: context,
        user_agent: navigator.userAgent
      },
      'high'
    );
  }

  /**
   * Obtiene estadísticas del optimizer
   */
  getStats() {
    return {
      ...this.stats,
      queueSizes: {
        events: this.eventQueue.length,
        metrics: this.metricQueue.length
      },
      isReady: this.isAnalyticsReady,
      isOnline: this.isOnline,
      sampling: this.shouldSample
    };
  }

  /**
   * Limpia recursos
   */
  destroy() {
    this.flushQueue('destroy');
    this.eventQueue = [];
    this.metricQueue = [];

    if (this.debugMode) {
      delete window.analyticsOptimizer;
    }
  }
}

// Crear instancia global
const analyticsOptimizer = new AnalyticsOptimizer();

// Exportar para uso en otros módulos
export { analyticsOptimizer, AnalyticsOptimizer };

// Hacer disponible globalmente para legacy code
if (typeof window !== 'undefined') {
  window.analyticsOptimizer = analyticsOptimizer;
}

// Integración con gtag existente para compatibilidad
if (typeof window !== 'undefined' && !window.gtag) {
  // Crear gtag proxy que usa el optimizer
  window.gtag = function (command, ...args) {
    if (command === 'event') {
      const [action, parameters] = args;
      analyticsOptimizer.trackEvent(
        {
          action: action,
          ...parameters
        },
        parameters?.priority || 'normal'
      );
    } else {
      // Para config y otros comandos, encolar hasta que gtag real esté listo
      analyticsOptimizer.trackEvent(
        {
          gtag_command: command,
          gtag_args: args,
          internal: true
        },
        'high'
      );
    }
  };
}

console.log('✅ Analytics Optimizer inicializado');
