// INP Optimizer - Herramientas específicas para mejorar Interaction to Next Paint
// Este módulo contiene optimizaciones específicas para reducir el tiempo de respuesta

/**
 * Manager global para optimizar INP en toda la aplicación
 */
class INPOptimizer {
  constructor() {
    this.taskQueue = [];
    this.isProcessing = false;
    this.maxTaskDuration = 50; // 50ms — reduce overhead de scheduling en móvil
    this.interactions = new Map();
    this.init();
  }

  init() {
    this.monitorLongTasks();
    this.optimizeExistingEvents();
  }

  /**
   * Programa una tarea para ejecutar en el próximo frame disponible
   */
  scheduleTask(task, priority = 'normal') {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        task,
        priority,
        resolve,
        reject,
        timestamp: performance.now()
      });

      if (!this.isProcessing) {
        this.processTaskQueue();
      }
    });
  }

  async processTaskQueue() {
    if (this.taskQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    // Ordenar por prioridad
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const processChunk = async () => {
      const startTime = performance.now();

      while (
        this.taskQueue.length > 0 &&
        performance.now() - startTime < this.maxTaskDuration
      ) {
        const { task, resolve, reject } = this.taskQueue.shift();

        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }

      if (this.taskQueue.length > 0) {
        // Yield to main thread si hay más tareas
        if ('scheduler' in window && 'postTask' in window.scheduler) {
          await window.scheduler.postTask(processChunk, {
            priority: 'user-blocking'
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } else {
        this.isProcessing = false;
      }
    };

    await processChunk();
  }

  /**
   * Optimiza automáticamente event listeners existentes
   */
  optimizeExistingEvents() {
    const elements = document.querySelectorAll(
      '[onclick], [onmouseover], [onmouseout]'
    );

    elements.forEach(element => {
      // Reemplazar onclick inline con event listeners optimizados
      if (element.hasAttribute('onclick')) {
        const onclickCode = element.getAttribute('onclick');
        element.removeAttribute('onclick');

        const optimizedHandler = this.createOptimizedHandler(() => {
          // Ejecutar el código original de forma segura
          try {
            Function(onclickCode).call(element);
          } catch (error) {
            console.warn('Error executing optimized onclick:', error);
          }
        });

        element.addEventListener('click', optimizedHandler, { passive: false });
      }
    });
  }

  /**
   * Crea un handler optimizado con medición de INP
   */
  createOptimizedHandler(originalHandler, options = {}) {
    const { enableTracking = true, priority = 'normal' } = options;

    return event => {
      const interactionId = `${event.type}-${Date.now()}`;
      const startTime = performance.now();

      if (enableTracking) {
        this.interactions.set(interactionId, {
          type: event.type,
          target: event.target.tagName,
          startTime
        });
      }

      // Programar el handler como una tarea optimizada
      this.scheduleTask(() => {
        return new Promise(resolve => {
          originalHandler(event);
          resolve();
        });
      }, priority).then(() => {
        if (enableTracking) {
          const duration = performance.now() - startTime;
          this.logInteraction(interactionId, duration);
        }
      });
    };
  }

  /**
   * Monitor para detectar tareas que bloquean el main thread
   */
  monitorLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(
              `⚠️ Long Task detectada: ${entry.duration.toFixed(2)}ms`
            );

            // Sugerir optimizaciones automáticamente
            this.suggestOptimizations(entry);
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported');
    }
  }

  logInteraction(interactionId, duration) {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) return;

    if (duration > 100) {
      console.warn(
        `🐌 Interacción lenta: ${interaction.type} en ${
          interaction.target
        } - ${duration.toFixed(2)}ms`
      );
    }

    this.interactions.delete(interactionId);
  }

  suggestOptimizations(entry) {
    const suggestions = [
      '• Usar requestAnimationFrame para animaciones',
      '• Dividir tareas largas con setTimeout(0) o scheduler.postTask',
      '• Implementar lazy loading para contenido no crítico',
      '• Usar CSS containment para elementos complejos',
      '• Optimizar selectores DOM y cachear referencias'
    ];

    console.group('💡 Sugerencias para optimizar INP:');
    suggestions.forEach(suggestion => console.log(suggestion));
    console.groupEnd();
  }

  /**
   * Optimiza una función para mejor INP dividiendo el trabajo
   */
  optimizeFunction(fn, chunkSize = 100) {
    return async function (...args) {
      const result = await window.inpOptimizer.scheduleTask(() =>
        fn.apply(this, args)
      );
      return result;
    };
  }

  /**
   * Aplica optimizaciones automáticas a elementos comunes
   */
  autoOptimize() {
    // Optimizar formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        this.optimizeFormInput(input);
      });
    });

    // Optimizar tablas grandes
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      if (table.rows.length > 50) {
        this.optimizeTable(table);
      }
    });

    // Optimizar listas largas
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      if (list.children.length > 100) {
        this.optimizeList(list);
      }
    });
  }

  optimizeFormInput(input) {
    // Aplicar debounce a inputs de texto
    if (
      input.type === 'text' ||
      input.type === 'search' ||
      input.tagName === 'TEXTAREA'
    ) {
      const originalHandler = input.oninput;
      if (originalHandler) {
        input.oninput = null;
        const debouncedHandler = this.debounce(originalHandler, 150);
        input.addEventListener('input', debouncedHandler, { passive: true });
      }
    }
  }

  optimizeTable(table) {
    // Aplicar CSS containment
    table.style.contain = 'layout style paint';

    // Lazy loading para filas no visibles
    if ('IntersectionObserver' in window) {
      const rows = Array.from(table.rows);
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.visibility = 'visible';
            }
          });
        },
        { rootMargin: '50px' }
      );

      rows.slice(20).forEach(row => {
        row.style.visibility = 'hidden';
        observer.observe(row);
      });
    }
  }

  optimizeList(list) {
    // Virtualizar listas muy largas
    list.style.contain = 'layout style';
    list.style.willChange = 'scroll-position';
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

// Instancia global
const inpOptimizer = new INPOptimizer();

// Exportar para uso en otros módulos
export { inpOptimizer, INPOptimizer };

// Auto-optimizar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      // Usar setTimeout como fallback para mejor compatibilidad
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => inpOptimizer.autoOptimize(), {
          timeout: 2000
        });
      } else {
        setTimeout(() => inpOptimizer.autoOptimize(), 0);
      }
    },
    { once: true }
  );
} else {
  // Usar setTimeout como fallback para mejor compatibilidad
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => inpOptimizer.autoOptimize(), { timeout: 2000 });
  } else {
    setTimeout(() => inpOptimizer.autoOptimize(), 0);
  }
}

// Hacer disponible globalmente para debugging
window.inpOptimizer = inpOptimizer;
