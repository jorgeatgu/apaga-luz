// D3 Worker Manager - Interfaz para comunicación optimizada con Web Worker
// Maneja la comunicación, cache y fallbacks para el d3-worker.js

class D3WorkerManager {
  constructor() {
    this.worker = null;
    this.isWorkerSupported = typeof Worker !== 'undefined';
    this.isWorkerReady = false;
    this.taskQueue = new Map();
    this.taskId = 0;
    this.fallbackCache = new Map(); // Cache para cuando no hay worker support

    this.init();
  }

  async init() {
    if (!this.isWorkerSupported) {
      console.warn('Web Workers not supported, using main thread fallback');
      return;
    }

    try {
      // Crear worker desde URL relativa
      this.worker = new Worker('/source/javascript/d3-worker.js');

      // Configurar listeners
      this.worker.addEventListener(
        'message',
        this.handleWorkerMessage.bind(this)
      );
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));

      // Esperar a que el worker esté listo (timeout de 5 segundos)
      await this.waitForWorkerReady(5000);
    } catch (error) {
      console.warn(
        'Failed to initialize D3 Worker, falling back to main thread:',
        error
      );
      this.worker = null;
      this.isWorkerSupported = false;
    }
  }

  waitForWorkerReady(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Worker initialization timeout'));
      }, timeout);

      const checkReady = event => {
        if (event.data.type === 'WORKER_READY') {
          this.isWorkerReady = true;
          clearTimeout(timeoutId);
          this.worker.removeEventListener('message', checkReady);
          resolve();
        }
      };

      if (this.worker) {
        this.worker.addEventListener('message', checkReady);
      } else {
        clearTimeout(timeoutId);
        resolve(); // Fallback sin worker
      }
    });
  }

  handleWorkerMessage(event) {
    const { id, type, result, error, success } = event.data;

    if (type === 'WORKER_READY') {
      this.isWorkerReady = true;
      return;
    }

    const task = this.taskQueue.get(id);
    if (!task) return;

    clearTimeout(task.timeout);
    this.taskQueue.delete(id);

    if (success) {
      task.resolve(result);
    } else {
      task.reject(new Error(error.message));
    }
  }

  handleWorkerError(error) {
    console.error('D3 Worker error:', error);

    // Reject all pending tasks
    this.taskQueue.forEach(task => {
      clearTimeout(task.timeout);
      task.reject(new Error('Worker error occurred'));
    });
    this.taskQueue.clear();
  }

  /**
   * Ejecuta tarea en worker con fallback a main thread
   */
  async executeTask(type, data, options = {}, timeoutMs = 10000) {
    // Fallback directo si no hay soporte de worker
    if (!this.isWorkerSupported || !this.worker || !this.isWorkerReady) {
      return this.executeFallback(type, data, options);
    }

    const taskId = ++this.taskId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.taskQueue.delete(taskId);
        reject(new Error(`Task ${type} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.taskQueue.set(taskId, {
        resolve,
        reject,
        timeout
      });

      // Enviar tarea al worker
      this.worker.postMessage({
        id: taskId,
        type,
        data,
        options
      });
    });
  }

  /**
   * Fallback implementations para cuando no hay worker support
   */
  async executeFallback(type, data, options = {}) {
    const cacheKey = `${type}_${JSON.stringify({
      data: data?.length || 0,
      options
    })}`;

    // Verificar cache primero
    if (this.fallbackCache.has(cacheKey)) {
      return this.fallbackCache.get(cacheKey);
    }

    let result;

    try {
      switch (type) {
        case 'PROCESS_LINE_CHART':
          result = await this.fallbackProcessLineChart(data, options);
          break;

        case 'PROCESS_AREA_STACKED':
          result = await this.fallbackProcessAreaStacked(data, options);
          break;

        case 'CALCULATE_SCALES':
          result = this.fallbackCalculateScales(data, options);
          break;

        case 'OPTIMIZE_PATH':
          result = this.fallbackOptimizePath(data, options);
          break;

        default:
          throw new Error(`Unsupported fallback task: ${type}`);
      }

      // Cache resultado (máximo 20 items)
      if (this.fallbackCache.size >= 20) {
        const firstKey = this.fallbackCache.keys().next().value;
        this.fallbackCache.delete(firstKey);
      }
      this.fallbackCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`Fallback task ${type} failed:`, error);
      throw error;
    }
  }

  // Fallback implementations
  async fallbackProcessLineChart(data, options = {}) {
    const {
      xAxisProp = 'date',
      yAxisProp = 'price',
      sortData = true,
      chunkSize = 50 // Más pequeño en main thread
    } = options;

    let processedData = Array.isArray(data) ? [...data] : [];

    // Chunked processing con yields más frecuentes
    if (processedData.length > chunkSize) {
      const result = [];

      for (let i = 0; i < processedData.length; i += chunkSize) {
        const chunk = processedData.slice(i, i + chunkSize).map(d => {
          const processed = { ...d };
          if (
            processed[xAxisProp] &&
            typeof processed[xAxisProp] === 'string'
          ) {
            processed[xAxisProp] = new Date(processed[xAxisProp]);
          }
          if (processed[yAxisProp]) {
            processed[yAxisProp] = parseFloat(processed[yAxisProp]) || 0;
          }
          return processed;
        });

        result.push(...chunk);

        // Yield más frecuente en main thread
        if (i % chunkSize === 0) {
          await new Promise(resolve => {
            if ('scheduler' in window && 'postTask' in window.scheduler) {
              window.scheduler.postTask(resolve, { priority: 'background' });
            } else {
              setTimeout(resolve, 0);
            }
          });
        }
      }
      processedData = result;
    } else {
      processedData = processedData.map(d => {
        const processed = { ...d };
        if (processed[xAxisProp] && typeof processed[xAxisProp] === 'string') {
          processed[xAxisProp] = new Date(processed[xAxisProp]);
        }
        if (processed[yAxisProp]) {
          processed[yAxisProp] = parseFloat(processed[yAxisProp]) || 0;
        }
        return processed;
      });
    }

    if (sortData) {
      processedData.sort((a, b) => {
        const aVal = a[xAxisProp];
        const bVal = b[xAxisProp];
        if (aVal instanceof Date && bVal instanceof Date) {
          return aVal.getTime() - bVal.getTime();
        }
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }

    return {
      data: processedData,
      stats: {
        count: processedData.length,
        hasValidDates: processedData.every(
          d => d[xAxisProp] instanceof Date && !isNaN(d[xAxisProp])
        ),
        yRange: {
          min: Math.min(...processedData.map(d => d[yAxisProp] || 0)),
          max: Math.max(...processedData.map(d => d[yAxisProp] || 0))
        }
      }
    };
  }

  async fallbackProcessAreaStacked(csvText, options = {}) {
    const { chunkSize = 50 } = options;
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    // Procesar en chunks pequeños
    for (let i = 1; i < lines.length; i += chunkSize) {
      const chunk = [];
      for (let j = i; j < Math.min(i + chunkSize, lines.length); j++) {
        if (lines[j].trim() === '') continue;

        const values = lines[j].split(',');
        const row = {};

        headers.forEach((header, index) => {
          const cleanHeader = header.trim();
          const value = values[index] ? values[index].trim() : '0';

          if (cleanHeader === 'year') {
            row[cleanHeader] = new Date(value);
          } else {
            row[cleanHeader] = parseFloat(value) || 0;
          }
        });

        chunk.push(row);
      }

      data.push(...chunk);

      // Yield cada chunk
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const result = data.filter(d => d.year && !isNaN(d.year.getTime()));
    result.columns = headers.map(h => h.trim());

    return result;
  }

  fallbackCalculateScales(data, options = {}) {
    const {
      xAxisProp,
      yAxisProp,
      width = 800,
      height = 400,
      marginLeft = 50,
      marginRight = 50,
      marginTop = 20,
      marginBottom = 50
    } = options;

    const xValues = data.map(d => d[xAxisProp]).filter(v => v != null);
    const yValues = data
      .map(d => d[yAxisProp])
      .filter(v => v != null && !isNaN(v));

    return {
      x: {
        domain: [Math.min(...xValues), Math.max(...xValues)],
        range: [marginLeft, width - marginRight]
      },
      y: {
        domain: [Math.min(...yValues) * 0.95, Math.max(...yValues) * 1.05],
        range: [height - marginBottom, marginTop]
      }
    };
  }

  fallbackOptimizePath(data, options = {}) {
    const { tolerance = 0.5 } = options;
    if (data.length <= 100) return data;

    const step = Math.max(1, Math.floor(data.length / 500));
    const simplified = [];

    for (let i = 0; i < data.length; i += step) {
      simplified.push(data[i]);
    }

    if (simplified[simplified.length - 1] !== data[data.length - 1]) {
      simplified.push(data[data.length - 1]);
    }

    return simplified;
  }

  /**
   * API Methods públicos
   */
  async processLineChartData(data, options = {}) {
    return this.executeTask('PROCESS_LINE_CHART', data, options);
  }

  async processAreaStackedData(csvText, options = {}) {
    return this.executeTask('PROCESS_AREA_STACKED', csvText, options);
  }

  async calculateScales(data, options = {}) {
    return this.executeTask('CALCULATE_SCALES', data, options);
  }

  async optimizePathData(data, options = {}) {
    return this.executeTask('OPTIMIZE_PATH', data, options);
  }

  async clearCache() {
    if (this.worker && this.isWorkerReady) {
      return this.executeTask('CLEAR_CACHE', null);
    } else {
      this.fallbackCache.clear();
      return { cleared: true };
    }
  }

  async getCacheStats() {
    if (this.worker && this.isWorkerReady) {
      return this.executeTask('CACHE_STATS', null);
    } else {
      return {
        size: this.fallbackCache.size,
        maxSize: 20,
        keys: Array.from(this.fallbackCache.keys())
      };
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.taskQueue.forEach(task => {
      clearTimeout(task.timeout);
      task.reject(new Error('Worker manager destroyed'));
    });

    this.taskQueue.clear();
    this.fallbackCache.clear();
    this.isWorkerReady = false;
  }
}

// Instancia singleton
const d3WorkerManager = new D3WorkerManager();

export { d3WorkerManager, D3WorkerManager };
