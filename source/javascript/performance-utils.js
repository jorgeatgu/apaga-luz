// Utilidades de rendimiento para optimizar INP

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
