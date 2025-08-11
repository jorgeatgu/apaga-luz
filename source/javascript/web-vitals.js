// Web Vitals monitoring para medir INP y otras métricas
// Este módulo se carga de forma lazy para no afectar el rendimiento inicial

export function initWebVitals() {
  // Solo cargar en producción
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    console.log('Web Vitals monitoring disabled in development');
    return;
  }

  // Cargar Web Vitals de forma dinámica
  import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js')
    .then(() => {
      if (window.webVitals) {
        const { onCLS, onFID, onFCP, onINP, onLCP, onTTFB } = window.webVitals;

        // Función para enviar métricas a Google Analytics
        function sendToAnalytics({ name, value, rating, delta }) {
          // Enviar a Google Analytics si está disponible
          if (window.gtag) {
            window.gtag('event', name, {
              value: Math.round(name === 'CLS' ? value * 1000 : value),
              metric_rating: rating,
              metric_delta: delta,
              non_interaction: true
            });
          }

          // También log en consola para debugging
          console.log(`[Web Vitals] ${name}:`, {
            value: value.toFixed(2),
            rating,
            delta: delta ? delta.toFixed(2) : 'N/A'
          });

          // Alerta si INP es mayor a 200ms
          if (name === 'INP' && value > 200) {
            console.warn(
              `⚠️ INP alto detectado: ${value.toFixed(2)}ms (objetivo: <200ms)`
            );
          }
        }

        // Registrar todas las métricas
        onCLS(sendToAnalytics);
        onFID(sendToAnalytics);
        onFCP(sendToAnalytics);
        onINP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);

        console.log('✅ Web Vitals monitoring iniciado');
      }
    })
    .catch(error => {
      console.error('Error loading Web Vitals:', error);
    });
}

// Función para medir interacciones específicas
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

      // Enviar a Google Analytics
      if (window.gtag) {
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

// Auto-inicializar cuando el documento esté listo
if (document.readyState === 'complete') {
  setTimeout(initWebVitals, 0);
} else {
  window.addEventListener('load', initWebVitals, { once: true });
}
