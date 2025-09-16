// D3 Web Worker - Procesamiento de datos off-main-thread para mejor INP
// Este worker maneja cálculos pesados de D3.js sin bloquear el main thread

// Cache LRU implementado en el worker para evitar recálculos
class WorkerLRUCache {
  constructor(maxSize = 20) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Mover al final (más reciente)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Eliminar el más antiguo
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// Instancia global del cache
const dataCache = new WorkerLRUCache(50);

/**
 * Procesa datos CSV para area stacked (energy consumption)
 * usando chunked processing para evitar long tasks
 */
async function processAreaStackedData(csvText, chunkSize = 100) {
  const cacheKey = `area_stacked_${csvText.length}_${chunkSize}`;

  // Verificar cache primero
  const cached = dataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data = [];

  // Chunked processing para evitar bloquear el worker
  const processChunk = async (startIndex, endIndex) => {
    const chunk = [];
    for (let i = startIndex; i < Math.min(endIndex, lines.length); i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',');
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
    return chunk;
  };

  // Procesar en chunks para yield control
  for (let i = 1; i < lines.length; i += chunkSize) {
    const chunk = await processChunk(i, i + chunkSize);
    data.push(...chunk);

    // Yield control cada chunk para no bloquear
    if (i % (chunkSize * 5) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Agregar columns para D3 stack
  const processedData = data.filter(d => d.year && !isNaN(d.year.getTime()));
  processedData.columns = headers.map(h => h.trim());

  // Cachear resultado
  dataCache.set(cacheKey, processedData);

  return processedData;
}

/**
 * Procesa datos JSON para line charts con optimizaciones
 */
async function processLineChartData(jsonData, options = {}) {
  const {
    xAxisProp = 'date',
    yAxisProp = 'price',
    sortData = true,
    chunkSize = 200
  } = options;

  const cacheKey = `line_${JSON.stringify(jsonData).slice(
    0,
    100
  )}_${xAxisProp}_${yAxisProp}`;

  const cached = dataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let data = Array.isArray(jsonData) ? [...jsonData] : [];

  // Chunked processing para datasets grandes
  if (data.length > chunkSize) {
    const processedData = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      const processedChunk = chunk.map(d => {
        const processed = { ...d };

        // Convertir fechas y números de forma optimizada
        if (processed[xAxisProp] && typeof processed[xAxisProp] === 'string') {
          processed[xAxisProp] = new Date(processed[xAxisProp]);
        }

        if (processed[yAxisProp]) {
          processed[yAxisProp] = parseFloat(processed[yAxisProp]) || 0;
        }

        return processed;
      });

      processedData.push(...processedChunk);

      // Yield control cada 5 chunks
      if (i % (chunkSize * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    data = processedData;
  } else {
    // Procesamiento directo para datasets pequeños
    data = data.map(d => {
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

  // Sort si es necesario
  if (sortData) {
    data.sort((a, b) => {
      const aVal = a[xAxisProp];
      const bVal = b[xAxisProp];

      if (aVal instanceof Date && bVal instanceof Date) {
        return aVal.getTime() - bVal.getTime();
      }

      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }

  // Calcular estadísticas útiles
  const result = {
    data,
    stats: {
      count: data.length,
      hasValidDates: data.every(
        d => d[xAxisProp] instanceof Date && !isNaN(d[xAxisProp])
      ),
      yRange: {
        min: Math.min(...data.map(d => d[yAxisProp] || 0)),
        max: Math.max(...data.map(d => d[yAxisProp] || 0))
      }
    }
  };

  dataCache.set(cacheKey, result);
  return result;
}

/**
 * Calcula scales D3 de forma optimizada
 */
function calculateD3Scales(data, options = {}) {
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

  // Calcular dominios
  const xDomain = [Math.min(...xValues), Math.max(...xValues)];

  const yDomain = [
    Math.min(...yValues) * 0.95, // Pequeño margen inferior
    Math.max(...yValues) * 1.05 // Pequeño margen superior
  ];

  // Calcular ranges
  const xRange = [marginLeft, width - marginRight];
  const yRange = [height - marginBottom, marginTop];

  return {
    x: { domain: xDomain, range: xRange },
    y: { domain: yDomain, range: yRange }
  };
}

/**
 * Optimiza path data para rendering más eficiente
 */
function optimizePathData(data, tolerance = 0.5) {
  if (data.length <= 100) return data;

  // Usar algoritmo Douglas-Peucker simplificado para reducir puntos
  const simplified = [];
  const step = Math.max(1, Math.floor(data.length / 500)); // Máximo 500 puntos

  for (let i = 0; i < data.length; i += step) {
    simplified.push(data[i]);
  }

  // Asegurar que tenemos el último punto
  if (simplified[simplified.length - 1] !== data[data.length - 1]) {
    simplified.push(data[data.length - 1]);
  }

  return simplified;
}

// Mensaje handler principal
self.addEventListener('message', async event => {
  const { id, type, data, options = {} } = event.data;

  try {
    let result;

    switch (type) {
      case 'PROCESS_AREA_STACKED':
        result = await processAreaStackedData(data, options.chunkSize);
        break;

      case 'PROCESS_LINE_CHART':
        result = await processLineChartData(data, options);
        break;

      case 'CALCULATE_SCALES':
        result = calculateD3Scales(data, options);
        break;

      case 'OPTIMIZE_PATH':
        result = optimizePathData(data, options.tolerance);
        break;

      case 'CLEAR_CACHE':
        dataCache.clear();
        result = { cleared: true };
        break;

      case 'CACHE_STATS':
        result = {
          size: dataCache.cache.size,
          maxSize: dataCache.maxSize,
          keys: Array.from(dataCache.cache.keys())
        };
        break;

      default:
        throw new Error(`Unknown worker task type: ${type}`);
    }

    // Enviar resultado de vuelta al main thread
    self.postMessage({
      id,
      type: `${type}_COMPLETE`,
      result,
      success: true
    });
  } catch (error) {
    // Enviar error de vuelta al main thread
    self.postMessage({
      id,
      type: `${type}_ERROR`,
      error: {
        message: error.message,
        stack: error.stack
      },
      success: false
    });
  }
});

// Notificar que el worker está listo
self.postMessage({
  type: 'WORKER_READY',
  timestamp: Date.now()
});
