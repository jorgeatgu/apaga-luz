// Utilidades de rendimiento para optimizar INP

/**
 * Debounce optimizado con cancelación y flush
 */
export function debounce(func, delay, options = {}) {
  let timeoutId;
  let lastArgs;
  let lastThis;
  let lastCallTime;
  let result;
  let isTrailing = options.trailing !== false;
  let isLeading = options.leading === true;

  const invokeFunc = () => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    result = func.apply(thisArg, args);
    return result;
  };

  const startTimer = time => {
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      if (isTrailing && lastArgs) {
        invokeFunc();
      }
    }, time);
  };

  const debounced = function (...args) {
    const time = Date.now();
    const isInvoking = isLeading && !timeoutId;

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (isInvoking) {
      startTimer(delay);
      return invokeFunc();
    }

    startTimer(delay);
    return result;
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    lastArgs = lastThis = timeoutId = undefined;
  };

  debounced.flush = () => {
    return timeoutId === undefined ? result : invokeFunc();
  };

  return debounced;
}

/**
 * Throttle optimizado con requestAnimationFrame y soporte para INP
 */
export function throttle(func, delay, options = {}) {
  let lastCall = 0;
  let timeout;
  let rafId;
  let lastArgs;
  let lastThis;
  let result;
  let isTrailing = options.trailing !== false;
  let isLeading = options.leading !== false;
  let useRAF = options.useRAF || false;

  const invokeFunc = () => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastCall = Date.now();
    result = func.apply(thisArg, args);
    return result;
  };

  const throttled = function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > delay) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (isLeading) {
        if (useRAF) {
          rafId = requestAnimationFrame(() => {
            invokeFunc();
            rafId = null;
          });
        } else {
          return invokeFunc();
        }
      }
    } else if (!timeout && !rafId && isTrailing) {
      if (useRAF) {
        rafId = requestAnimationFrame(() => {
          if (lastArgs) {
            invokeFunc();
          }
          rafId = null;
        });
      } else {
        timeout = setTimeout(() => {
          timeout = null;
          if (lastArgs) {
            invokeFunc();
          }
        }, remaining);
      }
    }

    return result;
  };

  throttled.cancel = () => {
    clearTimeout(timeout);
    if (rafId) cancelAnimationFrame(rafId);
    timeout = rafId = lastArgs = lastThis = null;
    lastCall = 0;
  };

  return throttled;
}

/**
 * Divide tareas largas usando requestIdleCallback con fallback
 */
export function chunkedTask(items, processItem, options = {}) {
  const {
    chunkSize = 10,
    onProgress = () => {},
    onComplete = () => {},
    priority = 'user-visible'
  } = options;

  let currentIndex = 0;
  let aborted = false;

  const processChunk = deadline => {
    const chunkEnd = Math.min(currentIndex + chunkSize, items.length);

    while (
      currentIndex < chunkEnd &&
      (deadline ? deadline.timeRemaining() > 0 : true) &&
      !aborted
    ) {
      processItem(items[currentIndex], currentIndex);
      currentIndex++;
    }

    onProgress(currentIndex, items.length);

    if (currentIndex < items.length && !aborted) {
      scheduleNextChunk();
    } else if (!aborted) {
      onComplete();
    }
  };

  const scheduleNextChunk = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(processChunk, { timeout: 50 });
    } else if ('scheduler' in window && 'postTask' in window.scheduler) {
      window.scheduler.postTask(processChunk, { priority });
    } else {
      setTimeout(() => processChunk(), 0);
    }
  };

  scheduleNextChunk();

  return {
    abort: () => {
      aborted = true;
    }
  };
}

/**
 * Batch DOM updates usando requestAnimationFrame
 */
export function batchDOMUpdates(updates) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();
      const results = updates.map(update => update(fragment));
      resolve(results);
    });
  });
}

/**
 * Lazy load con Intersection Observer
 */
export function lazyLoad(selector, loadCallback, options = {}) {
  const { root = null, rootMargin = '50px', threshold = 0.01 } = options;

  const elements = document.querySelectorAll(selector);

  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadCallback(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    elements.forEach(el => observer.observe(el));

    return observer;
  } else {
    // Fallback para navegadores sin IntersectionObserver
    elements.forEach(el => loadCallback(el));
  }
}

/**
 * Optimized event delegation
 */
export function delegate(element, eventType, selector, handler, options = {}) {
  const wrappedHandler = event => {
    const target = event.target.closest(selector);
    if (target && element.contains(target)) {
      handler.call(target, event);
    }
  };

  element.addEventListener(eventType, wrappedHandler, {
    passive: options.passive !== false,
    capture: options.capture || false
  });

  return () => element.removeEventListener(eventType, wrappedHandler, options);
}

/**
 * Memory-efficient cache con límite de tamaño
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * Detectar y reportar tareas largas
 */
export function monitorLongTasks(callback, threshold = 50) {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          callback({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  } catch (e) {
    console.warn('Long task monitoring not supported');
  }
}

/**
 * Scheduler optimizado para tareas de baja prioridad
 */
export function scheduleTask(task, priority = 'background') {
  if ('scheduler' in window && 'postTask' in window.scheduler) {
    return window.scheduler.postTask(task, { priority });
  } else if ('requestIdleCallback' in window) {
    return new Promise(resolve => {
      requestIdleCallback(
        () => {
          resolve(task());
        },
        { timeout: 5000 }
      );
    });
  } else {
    return new Promise(resolve => {
      setTimeout(() => resolve(task()), 0);
    });
  }
}

/**
 * Debounce especializado para inputs con mejor INP
 */
export function debounceInput(func, delay = 100) {
  let timeoutId;
  let rafId;

  return function (...args) {
    // Cancelar timers previos
    if (timeoutId) clearTimeout(timeoutId);
    if (rafId) cancelAnimationFrame(rafId);

    // Para inputs, usar rAF para mejor responsividad
    rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    });
  };
}

/**
 * Cache especializado para operaciones DOM costosas
 */
export class DOMCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(selector) {
    if (this.cache.has(selector)) {
      const entry = this.cache.get(selector);
      // Verificar si el elemento sigue en el DOM
      if (document.contains(entry.element)) {
        return entry.element;
      } else {
        this.cache.delete(selector);
      }
    }

    const element = document.querySelector(selector);
    if (element) {
      this.set(selector, element);
    }
    return element;
  }

  set(selector, element) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(selector, {
      element,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * Yielding mejorado para operaciones largas
 */
export function yieldToMain() {
  return new Promise(resolve => {
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      window.scheduler.postTask(resolve, { priority: 'user-blocking' });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Optimizador de event listeners
 */
export class EventOptimizer {
  constructor() {
    this.listeners = new Map();
  }

  add(element, event, handler, options = {}) {
    const key = `${element.tagName}-${event}`;

    // Aplicar passive por defecto a eventos de scroll/touch
    const passiveEvents = [
      'scroll',
      'wheel',
      'touchstart',
      'touchmove',
      'touchend'
    ];
    if (passiveEvents.includes(event) && options.passive === undefined) {
      options.passive = true;
    }

    // Throttle por defecto a eventos frecuentes
    const frequentEvents = ['scroll', 'resize', 'mousemove', 'touchmove'];
    let finalHandler = handler;

    if (frequentEvents.includes(event) && !options.noThrottle) {
      finalHandler = throttle(handler, options.throttleDelay || 16);
    }

    element.addEventListener(event, finalHandler, options);

    // Guardar para cleanup
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, handler: finalHandler, options });
  }

  removeAll(element) {
    if (this.listeners.has(element)) {
      const elementListeners = this.listeners.get(element);
      elementListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.listeners.delete(element);
    }
  }

  cleanup() {
    this.listeners.forEach((listeners, element) => {
      this.removeAll(element);
    });
  }
}
