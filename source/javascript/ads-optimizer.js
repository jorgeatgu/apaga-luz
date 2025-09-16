// ads-optimizer.js - Optimización de Google AdSense para mejorar INP
// Este módulo gestiona la carga inteligente de anuncios para minimizar el impacto en el rendimiento

/**
 * AdsOptimizer - Gestor centralizado de anuncios con optimización de rendimiento
 * Implementa lazy loading, detección de ad blockers y gestión inteligente de carga
 */
class AdsOptimizer {
  constructor() {
    this.adsQueue = [];
    this.observer = null;
    this.isAdBlockerDetected = false;
    this.loadedAds = new Set();
    this.adBlockerTestElement = null;
    this.maxConcurrentAds = 2;
    this.loadingAds = 0;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000;

    // Configuración de prioridades
    this.priorityConfig = {
      aboveFold: { priority: 'high', timeout: 3000 },
      nearFold: { priority: 'medium', timeout: 5000 },
      belowFold: { priority: 'low', timeout: 10000 }
    };

    this.init();
  }

  init() {
    // Detectar ad blocker lo antes posible
    this.detectAdBlocker();

    // Configurar Intersection Observer para lazy loading
    this.setupIntersectionObserver();

    // Escuchar eventos de visibilidad de página
    this.setupVisibilityHandling();

    // Optimizar script principal de AdSense
    this.optimizeMainScript();
  }

  /**
   * Detecta si hay un ad blocker activo
   */
  async detectAdBlocker() {
    return new Promise(resolve => {
      // Crear elemento de prueba
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className =
        'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner';
      testAd.style.cssText =
        'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';

      document.body.appendChild(testAd);

      // Verificar después de un pequeño delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          const isBlocked =
            testAd.offsetHeight === 0 ||
            testAd.offsetWidth === 0 ||
            testAd.offsetLeft === 0 ||
            testAd.offsetTop === 0 ||
            testAd.offsetParent === null ||
            testAd.clientHeight === 0 ||
            testAd.clientWidth === 0 ||
            window.getComputedStyle(testAd).display === 'none' ||
            window.getComputedStyle(testAd).visibility === 'hidden';

          this.isAdBlockerDetected = isBlocked;

          // Limpiar elemento de prueba
          if (testAd.parentNode) {
            testAd.parentNode.removeChild(testAd);
          }

          if (isBlocked) {
            console.info(
              'Ad blocker detectado - mostrando contenido alternativo'
            );
            this.handleAdBlocker();
          }

          resolve(isBlocked);
        }, 100);
      });
    });
  }

  /**
   * Maneja la detección de ad blocker
   */
  handleAdBlocker() {
    // Buscar todos los contenedores de ads
    const adContainers = document.querySelectorAll(
      '[data-ad-slot], .adsbygoogle, #ad-container'
    );

    adContainers.forEach(container => {
      // Crear contenido alternativo
      const fallback = this.createFallbackContent(container);

      // Reemplazar o añadir después del contenedor
      if (container.parentNode) {
        container.style.display = 'none';
        container.parentNode.insertBefore(fallback, container.nextSibling);
      }
    });

    // Enviar evento a analytics si está disponible
    if (window.gtag) {
      window.gtag('event', 'ad_blocker_detected', {
        event_category: 'ads',
        non_interaction: true
      });
    }
  }

  /**
   * Crea contenido alternativo cuando se detecta ad blocker
   */
  createFallbackContent(originalContainer) {
    const fallback = document.createElement('div');
    fallback.className = 'ad-fallback-content';
    fallback.style.cssText = `
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;

    fallback.innerHTML = `
      <p style="margin: 0 0 10px 0; font-weight: bold;">
        🌟 Apoya a Apaga Luz
      </p>
      <p style="margin: 0; font-size: 14px; opacity: 0.95;">
        Este proyecto se mantiene gracias a la publicidad.
        Considera desactivar tu bloqueador de anuncios.
      </p>
    `;

    return fallback;
  }

  /**
   * Configura Intersection Observer para lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores antiguos
      this.loadAllAds();
      return;
    }

    const options = {
      rootMargin: '50px 0px', // Precargar 50px antes de que sea visible
      threshold: [0, 0.01]
    };

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loadedAds.has(entry.target)) {
          this.queueAdForLoading(entry.target);
        }
      });
    }, options);

    // Observar todos los contenedores de ads
    this.observeAdContainers();
  }

  /**
   * Observa todos los contenedores de anuncios
   */
  observeAdContainers() {
    // Buscar todos los elementos de ads
    const adElements = document.querySelectorAll(
      '.adsbygoogle:not([data-ad-loaded]), [data-lazy-ad]:not([data-ad-loaded])'
    );

    adElements.forEach(element => {
      // Determinar prioridad basada en posición
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      let priority = 'low';
      if (rect.top < viewportHeight) {
        priority = 'high'; // Above the fold
      } else if (rect.top < viewportHeight * 2) {
        priority = 'medium'; // Near the fold
      }

      element.setAttribute('data-ad-priority', priority);

      // Añadir placeholder para evitar CLS
      this.addPlaceholder(element);

      // Observar elemento
      if (priority === 'high') {
        // Cargar inmediatamente ads above the fold
        this.queueAdForLoading(element);
      } else {
        // Lazy load para el resto
        this.observer.observe(element);
      }
    });
  }

  /**
   * Añade placeholder para reservar espacio y evitar CLS
   */
  addPlaceholder(element) {
    if (element.querySelector('.ad-placeholder')) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'ad-placeholder';

    // Estimar tamaño basado en data attributes o valores por defecto
    const format = element.getAttribute('data-ad-format');
    let height = '280px'; // Default height

    if (format === 'auto' || format === 'fluid') {
      height = '280px';
    } else if (format === 'rectangle') {
      height = '250px';
    } else if (format === 'horizontal') {
      height = '90px';
    }

    placeholder.style.cssText = `
      min-height: ${height};
      background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      position: relative;
    `;

    // Añadir animación shimmer
    if (!document.querySelector('#ad-shimmer-style')) {
      const style = document.createElement('style');
      style.id = 'ad-shimmer-style';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ad-placeholder::after {
          content: "Cargando anuncio...";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #999;
          font-size: 12px;
        }
      `;
      document.head.appendChild(style);
    }

    element.appendChild(placeholder);
  }

  /**
   * Añade un anuncio a la cola de carga
   */
  queueAdForLoading(element) {
    if (this.loadedAds.has(element)) return;

    const priority = element.getAttribute('data-ad-priority') || 'low';

    this.adsQueue.push({
      element,
      priority,
      timestamp: performance.now()
    });

    // Ordenar por prioridad
    this.adsQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Procesar cola
    this.processQueue();
  }

  /**
   * Procesa la cola de anuncios pendientes
   */
  async processQueue() {
    if (
      this.adsQueue.length === 0 ||
      this.loadingAds >= this.maxConcurrentAds
    ) {
      return;
    }

    // No cargar ads si la página no es visible
    if (document.hidden) {
      return;
    }

    const adInfo = this.adsQueue.shift();
    if (!adInfo) return;

    this.loadingAds++;

    try {
      await this.loadAd(adInfo.element, adInfo.priority);
    } catch (error) {
      console.warn('Error cargando anuncio:', error);
      this.handleAdError(adInfo.element);
    } finally {
      this.loadingAds--;
      // Continuar procesando la cola
      if (this.adsQueue.length > 0) {
        // Usar scheduler API si está disponible
        if ('scheduler' in window && 'postTask' in window.scheduler) {
          await window.scheduler.postTask(() => this.processQueue(), {
            priority: 'background'
          });
        } else {
          setTimeout(() => this.processQueue(), 100);
        }
      }
    }
  }

  /**
   * Carga un anuncio específico
   */
  async loadAd(element, priority = 'low') {
    // Marcar como cargado para evitar duplicados
    this.loadedAds.add(element);
    element.setAttribute('data-ad-loaded', 'true');

    // Si hay ad blocker, no intentar cargar
    if (this.isAdBlockerDetected) {
      return;
    }

    const config =
      this.priorityConfig[
        priority === 'high'
          ? 'aboveFold'
          : priority === 'medium'
          ? 'nearFold'
          : 'belowFold'
      ];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout cargando anuncio'));
      }, config.timeout);

      // Usar requestIdleCallback para mejor INP
      const loadFunction = () => {
        try {
          // Remover placeholder
          const placeholder = element.querySelector('.ad-placeholder');
          if (placeholder) {
            placeholder.style.opacity = '0';
            setTimeout(() => placeholder.remove(), 300);
          }

          // Cargar anuncio con AdSense
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }

          clearTimeout(timeout);
          resolve();

          // Track successful load
          if (window.gtag) {
            window.gtag('event', 'ad_loaded', {
              event_category: 'ads',
              event_label: priority,
              value: Math.round(performance.now()),
              non_interaction: true
            });
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadFunction, { timeout: config.timeout });
      } else {
        setTimeout(loadFunction, 0);
      }
    });
  }

  /**
   * Maneja errores en la carga de anuncios
   */
  handleAdError(element) {
    const attempts = this.retryAttempts.get(element) || 0;

    if (attempts < this.maxRetries) {
      // Reintentar con backoff exponencial
      this.retryAttempts.set(element, attempts + 1);
      const delay = this.retryDelay * Math.pow(2, attempts);

      setTimeout(() => {
        this.loadedAds.delete(element);
        element.removeAttribute('data-ad-loaded');
        this.queueAdForLoading(element);
      }, delay);
    } else {
      // Mostrar fallback después de máximo de reintentos
      console.warn('No se pudo cargar el anuncio después de varios intentos');
      const fallback = this.createFallbackContent(element);
      element.parentNode.insertBefore(fallback, element.nextSibling);
      element.style.display = 'none';
    }
  }

  /**
   * Configura manejo de visibilidad de página
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.adsQueue.length > 0) {
        // Reanudar carga cuando la página sea visible
        this.processQueue();
      }
    });
  }

  /**
   * Optimiza el script principal de AdSense
   */
  optimizeMainScript() {
    // Buscar el script de AdSense en el head
    const adScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com"]'
    );

    if (adScript && !adScript.hasAttribute('data-optimized')) {
      // Marcar como optimizado
      adScript.setAttribute('data-optimized', 'true');

      // Si el script aún no se ha cargado, añadir atributos de optimización
      if (!adScript.hasAttribute('async') && !adScript.hasAttribute('defer')) {
        adScript.setAttribute('async', '');
      }

      // Añadir crossorigin para mejor error handling
      if (!adScript.hasAttribute('crossorigin')) {
        adScript.setAttribute('crossorigin', 'anonymous');
      }
    }
  }

  /**
   * Carga todos los anuncios (fallback para navegadores antiguos)
   */
  loadAllAds() {
    const adElements = document.querySelectorAll(
      '.adsbygoogle:not([data-ad-loaded])'
    );
    adElements.forEach(element => {
      this.queueAdForLoading(element);
    });
  }

  /**
   * Pausa la carga de anuncios
   */
  pause() {
    this.adsQueue = [];
    this.loadingAds = 0;
  }

  /**
   * Reanuda la carga de anuncios
   */
  resume() {
    this.observeAdContainers();
    this.processQueue();
  }

  /**
   * Limpia recursos
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.adsQueue = [];
    this.loadedAds.clear();
    this.retryAttempts.clear();
  }
}

// Crear instancia global
const adsOptimizer = new AdsOptimizer();

// Exportar para uso en otros módulos
export { adsOptimizer, AdsOptimizer };

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.adsOptimizer = adsOptimizer;
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Dar tiempo a que se carguen los elementos
    setTimeout(() => adsOptimizer.observeAdContainers(), 100);
  });
} else {
  // DOM ya cargado
  setTimeout(() => adsOptimizer.observeAdContainers(), 100);
}
