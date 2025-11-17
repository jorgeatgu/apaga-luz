/**
 * AdSense Loader - Carga inteligente balanceando INP y monetización
 * Estrategia: Hybrid Progressive Loading adaptada a device y conexión
 *
 * - Desktop/rápido: Carga después de FCP + requestIdleCallback (1s)
 * - Mobile/normal: Carga después de interacción O 2s (lo que primero ocurra)
 * - Conexión lenta: Carga después de interacción O 3s
 */

class AdSenseLoader {
  constructor() {
    this.pubId = 'ca-pub-8990231994528437';
    this.scriptLoaded = false;
    this.scriptLoading = false;
    this.loadStartTime = null;
    this.strategy = this.determineLoadStrategy();
    this.testGroup = this.assignTestGroup();

    // Debug mode (cambiar a false en producción)
    this.debug = false;
  }

  /**
   * Determinar estrategia basada en device y conexión
   */
  determineLoadStrategy() {
    const isMobile = window.innerWidth < 768;
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const effectiveType = connection?.effectiveType || '4g';

    // Conexión lenta
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'delayed'; // 3s delay
    }

    // Mobile con conexión normal
    if (isMobile && (effectiveType === '3g' || effectiveType === '4g')) {
      return 'hybrid'; // Interacción O 2s
    }

    // Desktop o Mobile con conexión rápida
    return 'early'; // Después de FCP + requestIdleCallback
  }

  /**
   * Asignar grupo de test para A/B testing
   */
  assignTestGroup() {
    let group = sessionStorage.getItem('adsense_test_group');

    if (!group) {
      const random = Math.random();

      if (random < 0.33) {
        group = 'control';
      } else if (random < 0.67) {
        group = 'hybrid';
      } else {
        group = 'delayed';
      }

      sessionStorage.setItem('adsense_test_group', group);
    }

    return group;
  }

  /**
   * Inicializar loader
   */
  async init() {
    this.log(
      `AdSense Loader initialized - Strategy: ${this.strategy}, Test Group: ${this.testGroup}`
    );
    this.loadStartTime = performance.now();

    // Si es grupo control, usar comportamiento actual
    if (this.testGroup === 'control') {
      this.log('Control group detected - skipping lazy loading');
      return;
    }

    // Ejecutar estrategia correspondiente
    switch (this.strategy) {
      case 'early':
        await this.loadEarly();
        break;
      case 'hybrid':
        await this.loadHybrid();
        break;
      case 'delayed':
        await this.loadDelayed();
        break;
    }
  }

  /**
   * ESTRATEGIA A: Early load (Desktop/rápido)
   * Mejor para monetización, impacta menos en INP
   */
  async loadEarly() {
    this.log('Using EARLY strategy');

    // Esperar a First Contentful Paint
    await this.waitForFCP();
    this.log('FCP detected, preparing to load AdSense');

    // Cargar con requestIdleCallback (timeout 1s)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.loadScript(), { timeout: 1000 });
    } else {
      setTimeout(() => this.loadScript(), 100);
    }
  }

  /**
   * ESTRATEGIA B: Hybrid (Mobile/normal) - RECOMENDADA
   * Balancea monetización con performance
   */
  async loadHybrid() {
    this.log('Using HYBRID strategy');

    // Esperar interacción O 2 segundos (lo que ocurra primero)
    const interactionPromise = this.waitForInteraction();
    const timeoutPromise = this.wait(2000);

    const result = await Promise.race([interactionPromise, timeoutPromise]);
    this.log(`Hybrid trigger: ${result}`);

    // Cargar con prioridad baja
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      await window.scheduler.postTask(() => this.loadScript(), {
        priority: 'background'
      });
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.loadScript(), { timeout: 2500 });
    } else {
      setTimeout(() => this.loadScript(), 0);
    }
  }

  /**
   * ESTRATEGIA C: Delayed (Conexión lenta)
   * Espera más tiempo para no impactar experiencia
   */
  async loadDelayed() {
    this.log('Using DELAYED strategy');

    // Esperar interacción O 3 segundos
    const interactionPromise = this.waitForInteraction();
    const timeoutPromise = this.wait(3000);

    const result = await Promise.race([interactionPromise, timeoutPromise]);
    this.log(`Delayed trigger: ${result}`);

    requestIdleCallback(() => this.loadScript(), { timeout: 4000 });
  }

  /**
   * Cargar el script de AdSense
   */
  loadScript() {
    if (this.scriptLoaded || this.scriptLoading) return;

    this.scriptLoading = true;
    this.log('Loading AdSense script...');

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.pubId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-overlays', 'bottom');

    script.onload = () => {
      this.scriptLoaded = true;
      this.scriptLoading = false;
      const loadTime = performance.now() - this.loadStartTime;

      this.log(
        `✅ AdSense loaded in ${loadTime.toFixed(0)}ms (Strategy: ${
          this.strategy
        })`
      );

      // Analytics tracking
      this.trackLoading(loadTime, 'success');

      // Inicializar ads-optimizer.js AHORA
      if (
        window.adsOptimizer &&
        typeof window.adsOptimizer.observeAdContainers === 'function'
      ) {
        this.log('Triggering ads-optimizer...');
        window.adsOptimizer.observeAdContainers();
      }
    };

    script.onerror = () => {
      this.scriptLoading = false;
      console.error('❌ AdSense script failed to load');
      this.trackLoading(0, 'error');
    };

    document.head.appendChild(script);
  }

  /**
   * Esperar a First Contentful Paint
   */
  waitForFCP() {
    return new Promise(resolve => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              resolve('FCP');
              return;
            }
          }
        });

        try {
          observer.observe({ type: 'paint', buffered: true });
        } catch (e) {
          // Safari doesn't support paint observer
          setTimeout(() => resolve('FCP-timeout'), 1000);
        }

        // Timeout de seguridad
        setTimeout(() => {
          observer.disconnect();
          resolve('FCP-timeout');
        }, 3000);
      } else {
        // Fallback: esperar a load event
        if (document.readyState === 'complete') {
          resolve('FCP-complete');
        } else {
          window.addEventListener('load', () => resolve('FCP-load'), {
            once: true
          });
        }
      }
    });
  }

  /**
   * Esperar a primera interacción del usuario
   */
  waitForInteraction() {
    return new Promise(resolve => {
      const events = ['click', 'touchstart', 'keydown', 'scroll'];
      let resolved = false;

      const handler = () => {
        if (!resolved) {
          resolved = true;
          events.forEach(event => {
            document.removeEventListener(event, handler, {
              passive: true,
              capture: true
            });
          });
          resolve('interaction');
        }
      };

      events.forEach(event => {
        document.addEventListener(event, handler, {
          passive: true,
          capture: true
        });
      });
    });
  }

  /**
   * Helper: esperar X milisegundos
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve('timeout'), ms));
  }

  /**
   * Tracking de analytics para A/B testing
   */
  trackLoading(loadTimeMs, status) {
    try {
      if (window.gtag) {
        window.gtag('event', 'adsense_loaded', {
          event_category: 'adsense_optimization',
          event_label: `${this.strategy}_${this.testGroup}`,
          load_time_ms: Math.round(loadTimeMs),
          load_status: status,
          strategy: this.strategy,
          test_group: this.testGroup,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          non_interaction: true
        });
      }
    } catch (e) {
      this.log(`Error tracking: ${e.message}`);
    }
  }

  /**
   * Método público para forzar carga inmediata (testing/debug)
   */
  forceLoad() {
    this.log('Force loading AdSense');
    this.loadScript();
  }

  /**
   * Debug logging
   */
  log(message) {
    if (this.debug) {
      console.log(`[AdSense] ${message}`);
    }
  }
}

// Inicializar cuando DOM esté listo
const initializeAdSenseLoader = () => {
  window.adSenseLoader = new AdSenseLoader();
  window.adSenseLoader.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdSenseLoader, {
    once: true
  });
} else {
  initializeAdSenseLoader();
}

// Exportar para uso en otros módulos
export { AdSenseLoader };
export default AdSenseLoader;
