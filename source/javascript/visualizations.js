import './../styles/styles.css';
import { line_chart } from './line_chart.js';
/*import { area_stacked_json } from './area_stacked_json.js';*/
import { width_mobile, month_names } from './utils.js';
// Cargar estos datos de forma asíncrona cuando se necesiten
let data_historic_today = null;
let data_last_week = null;

// Función helper para cargar los datos JSON
async function loadJsonData() {
  try {
    const [historicResponse, weekResponse] = await Promise.all([
      fetch('/data/historic_today_price.json'),
      fetch('/data/last_week_price.json')
    ]);
    data_historic_today = await historicResponse.json();
    data_last_week = await weekResponse.json();
  } catch (error) {
    console.error('Error loading JSON data:', error);
  }
}
import { create_new_table } from './table.js';
import { initNavigation } from './navigation.js';
import { chunkedTask, throttle } from './performance-utils.js';
import { inpOptimizer } from './inp-optimizer.js';

const user_day = new Date();

const line_chart_by_month_options = {
  html_element: 'month-price',
  x_axis_prop: 'date',
  y_axis_prop: 'averagePrice',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_by_day_options = {
  html_element: 'day-price',
  x_axis_prop: 'date',
  y_axis_prop: 'price',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const get_table_historic_date = document.getElementById('js-table-date');
get_table_historic_date.textContent = ` el ${user_day.getDate()} de ${
  month_names[user_day.getMonth()]
}`;

const line_chart_by_day_of_month_options = {
  html_element: 'main-line-price',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  select_html: false,
  main_chart: true,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_group_by_day_options = {
  html_element: 'day-price-last-year',
  x_axis_prop: 'date',
  y_axis_prop: 'price',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

// Lazy Loading Inteligente con IntersectionObserver
class ChartLazyLoader {
  constructor() {
    this.loadedCharts = new Set();
    this.chartQueue = [];
    this.isProcessing = false;
    this.observer = null;
    this.allChartIds = [
      'precio-medio-luz-dia',
      'precio-medio-luz-mes',
      'precio-medio-luz-ultimo-year',
      'precio-medio-luz-ultimo-mes'
    ];
    // NO llamar init() aquí para evitar doble inicialización
  }

  init() {
    // Desconectar observer existente si hay uno para evitar duplicados
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // DESHABILITADO: IntersectionObserver - Usando carga secuencial en su lugar
    // El IntersectionObserver causaba problemas con la carga parcial de gráficos
    // La carga secuencial garantiza que todos los gráficos se carguen correctamente
    /*
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            console.log(`[Observer] ${entry.target.id}: isIntersecting=${entry.isIntersecting}, loaded=${this.loadedCharts.has(entry.target.id)}`);
            if (entry.isIntersecting && !this.loadedCharts.has(entry.target.id)) {
              console.log(`[Observer] Loading chart: ${entry.target.id}`);
              this.loadChartForElement(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '200px', // Cargar 200px antes de que sea visible
          threshold: 0.1
        }
      );
    }
    */

    // Configurar skeleton placeholders una sola vez
    this.setupSkeletonPlaceholders();
  }

  setupSkeletonPlaceholders() {
    // Usar la lista centralizada de IDs
    const chartContainers = this.allChartIds;

    chartContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        const chartDiv = container.querySelector('.charts');
        if (chartDiv && !chartDiv.querySelector('.chart-skeleton')) {
          // Crear skeleton sin destruir el SVG existente
          const skeleton = document.createElement('div');
          skeleton.className = 'chart-skeleton';
          skeleton.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 500px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 2s infinite;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
            z-index: 10;
          `;
          skeleton.innerHTML = '<div>Cargando gráfico...</div>';

          // Hacer el contenedor relativo para posicionar el skeleton
          chartDiv.style.position = 'relative';

          // Añadir skeleton al principio, sin destruir el SVG
          chartDiv.insertBefore(skeleton, chartDiv.firstChild);

          // Ocultar el SVG temporalmente
          const svg = chartDiv.querySelector('svg');
          if (svg) {
            svg.style.visibility = 'hidden';
          }

          // Ya no usamos observer - carga secuencial en su lugar
          // Los gráficos se cargarán uno por uno en loadAllChartsSequentially()
        }
      }
    });

    // Añadir CSS animation para skeleton
    if (!document.getElementById('skeleton-styles')) {
      const style = document.createElement('style');
      style.id = 'skeleton-styles';
      style.textContent = `
        @keyframes loading {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  async loadChartForElement(element) {
    if (this.loadedCharts.has(element.id)) {
      return;
    }

    this.loadedCharts.add(element.id);

    // Remover skeleton antes de cargar el gráfico
    const chartDiv = element.querySelector('.charts');
    if (chartDiv) {
      const skeleton = chartDiv.querySelector('.chart-skeleton');
      if (skeleton) {
        skeleton.remove();
      }
      // Mostrar el SVG nuevamente
      const svg = chartDiv.querySelector('svg');
      if (svg) {
        svg.style.visibility = 'visible';
      }
    }

    try {
      await inpOptimizer.scheduleTask(async () => {
        switch (element.id) {
          case 'precio-medio-luz-dia':
            await line_chart(
              '/data/group_prices_by_day.json',
              line_chart_by_day_options
            );
            break;

          case 'precio-medio-luz-mes':
            await line_chart(
              '/data/group_prices_by_month.json',
              line_chart_by_month_options
            );
            break;

          case 'precio-medio-luz-ultimo-year':
            await line_chart(
              '/data/last_year_group_price.json',
              line_chart_group_by_day_options
            );
            break;

          case 'precio-medio-luz-ultimo-mes':
            await line_chart(
              '/data/last_month_price.json',
              line_chart_by_day_of_month_options
            );
            break;
        }
      }, 'high');
    } catch (error) {
      console.error(`Failed to load chart for ${element.id}:`, error);
      // Remover de loadedCharts para permitir reintentos
      this.loadedCharts.delete(element.id);

      // Mostrar error en el placeholder
      const chartDiv = element.querySelector('.charts');
      if (chartDiv) {
        chartDiv.innerHTML = `
          <div style="
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d73a49;
            font-size: 14px;
          ">
            Error al cargar el gráfico. <button onclick="location.reload()"
              style="margin-left: 8px; padding: 4px 8px; border: 1px solid #d73a49; background: white; color: #d73a49; cursor: pointer;">
              Reintentar
            </button>
          </div>
        `;
      }
    }
  }

  async loadPriorityCharts() {
    // Cargar solo el gráfico más crítico inmediatamente
    const priorityElement = document.getElementById(
      'precio-medio-luz-ultimo-mes'
    );
    if (priorityElement) {
      await this.loadChartForElement(priorityElement);
    }
  }

  // Nuevo método para cargar todos los gráficos secuencialmente
  async loadAllChartsSequentially() {
    for (const chartId of this.allChartIds) {
      const element = document.getElementById(chartId);
      if (element && !this.loadedCharts.has(chartId)) {
        try {
          await this.loadChartForElement(element);
          // Pequeña pausa entre gráficos para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error loading ${chartId}:`, error);
        }
      }
    }
  }

  async loadTablesDeferred() {
    // Cargar tablas al final con baja prioridad
    await inpOptimizer.scheduleTask(() => {
      create_new_table(data_historic_today, 'table-year', 'year');
    }, 'low');

    await inpOptimizer.scheduleTask(() => {
      create_new_table(data_last_week, 'table-week', 'day');
    }, 'low');
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedCharts.clear();
    this.chartQueue = [];
  }
}

// Función principal de carga optimizada
async function loadChartsProgressively() {
  // Primero cargar los datos JSON necesarios
  await loadJsonData();

  const lazyLoader = new ChartLazyLoader();
  lazyLoader.init(); // Inicializar el loader con skeleton placeholders

  // Añadir delay para asegurar que los skeletons se muestren (300ms para mejor UX)
  await new Promise(resolve => setTimeout(resolve, 300));

  // NUEVO: Cargar todos los gráficos secuencialmente en lugar de usar lazy loading complejo
  // Esto garantiza que todos los gráficos se carguen correctamente
  await lazyLoader.loadAllChartsSequentially();

  // Cargar tablas con baja prioridad después de 2 segundos
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        lazyLoader.loadTablesDeferred();
      },
      { timeout: 2000 }
    );
  } else {
    setTimeout(() => {
      lazyLoader.loadTablesDeferred();
    }, 2000);
  }

  // Cleanup en beforeunload
  window.addEventListener(
    'beforeunload',
    () => {
      lazyLoader.destroy();
    },
    { once: true }
  );
}

// Iniciar carga progresiva cuando el DOM esté listo
document.addEventListener(
  'DOMContentLoaded',
  () => {
    // Pequeño delay para permitir que el layout se estabilice
    requestAnimationFrame(() => {
      loadChartsProgressively();
    });
  },
  { once: true }
);

// Inicializar navegación usando el módulo centralizado
document.addEventListener(
  'DOMContentLoaded',
  function () {
    initNavigation();
  },
  { once: true }
);
