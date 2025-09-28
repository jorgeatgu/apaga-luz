import { select, selectAll } from 'd3-selection';
import { min, max, extent, bisector, mean, median } from 'd3-array';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { json } from 'd3-fetch';
import { easeLinear } from 'd3-ease';
import { format } from 'd3-format';
import { interpolatePath } from 'd3-interpolate-path';
import 'd3-transition';
import { day_names, month_names, width_mobile } from './utils.js';
import {
  throttle as performanceThrottle,
  chunkedTask
} from './performance-utils.js';
import { inpOptimizer } from './inp-optimizer.js';
import { d3WorkerManager } from './d3-worker-manager.js';

// Usar throttle optimizado de performance-utils para mejor INP
const throttle = performanceThrottle;

// Cache LRU para datos procesados (main thread)
const chartDataCache = new Map();
const MAX_CACHE_SIZE = 15;

/**
 * Renderizado chunked de paths D3 para evitar long tasks
 */
async function renderPathChunked(container, data, lineGenerator, htmlElement) {
  const chunkSize = 200; // Puntos por chunk

  if (data.length <= chunkSize) {
    // Renderizado directo para datasets pequeños
    container
      .selectAll(`.line-${htmlElement}`)
      .data([data])
      .join('path')
      .attr('class', `line-${htmlElement}`)
      .transition()
      .duration(120) // Reducido para mejor INP
      .ease(d3.easeLinear)
      .attr('d', lineGenerator);
    return;
  }

  // Renderizado chunked para datasets grandes
  const pathElement = container
    .selectAll(`.line-${htmlElement}`)
    .data([data])
    .join('path')
    .attr('class', `line-${htmlElement}`);

  // Generar path en chunks
  let pathData = '';
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    // Asegurar continuidad entre chunks
    if (i > 0) {
      chunk.unshift(data[i - 1]);
    }

    const chunkPath = lineGenerator(chunk);
    if (chunkPath) {
      pathData += i === 0 ? chunkPath : chunkPath.replace(/^M[^L]*L/, 'L');
    }

    // Yield control cada 3 chunks
    if (i % (chunkSize * 3) === 0) {
      await new Promise(resolve => {
        if ('scheduler' in window && 'postTask' in window.scheduler) {
          window.scheduler.postTask(resolve, { priority: 'user-blocking' });
        } else {
          requestAnimationFrame(resolve);
        }
      });
    }
  }

  // Aplicar path final con transición optimizada
  pathElement
    .transition()
    .duration(150)
    .ease(d3.easeLinear)
    .attr('d', pathData);
}

// Función throttle local deprecada - usar performanceThrottle
function __deprecated_throttle(func, delay) {
  let lastCall = 0;
  let rafId = null;
  let lastArgs = null;
  let isIdle = false;

  return function (...args) {
    lastArgs = args;
    const now = Date.now();

    if (now - lastCall >= delay) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastCall = now;

      // Usar requestIdleCallback para operaciones no críticas
      if ('requestIdleCallback' in window && !isIdle) {
        isIdle = true;
        requestIdleCallback(
          deadline => {
            if (deadline.timeRemaining() > 5) {
              func.apply(this, lastArgs);
            } else {
              // Fallback a rAF si no hay tiempo suficiente
              requestAnimationFrame(() => func.apply(this, lastArgs));
            }
            isIdle = false;
          },
          { timeout: 50 }
        );
      } else {
        func.apply(this, lastArgs);
      }
    } else if (!rafId) {
      rafId = requestAnimationFrame(() => {
        lastCall = Date.now();
        func.apply(this, lastArgs);
        rafId = null;
      });
    }
  };
}

const d3 = {
  select,
  selectAll,
  min,
  max,
  bisector,
  line,
  scaleTime,
  scaleLinear,
  axisBottom,
  axisLeft,
  json,
  easeLinear,
  format,
  extent,
  mean,
  median,
  interpolatePath
};

export function line_chart(data_chart, element_options, selected_value = '') {
  const {
    html_element,
    x_axis_prop,
    y_axis_prop,
    select_html,
    main_chart,
    margin: { top, right, bottom, left }
  } = element_options;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-chart-${html_element}`);
  const svg = chart.select('svg');
  let scales = {};
  let line_chart_data;
  let line_chart_data_filter;
  const bisec_date = d3.bisector(d => d[x_axis_prop]).left;
  const tooltip = chart
    .append('div')
    .attr('class', `tooltip tooltip-${html_element}`)
    .style('opacity', 0);

  async function setup_scales() {
    // Usar worker si está disponible para datasets grandes
    if (line_chart_data.length > 100) {
      try {
        const scaleData = await d3WorkerManager.calculateScales(
          line_chart_data,
          {
            xAxisProp: x_axis_prop,
            yAxisProp: y_axis_prop,
            width: width || 800,
            height: height || 500
          }
        );

        const count_x = d3.scaleTime().domain(scaleData.x.domain);
        const count_y = d3.scaleLinear().domain(scaleData.y.domain);
        scales.count = { x: count_x, y: count_y };
        return;
      } catch (error) {
        console.warn('Worker scale calculation failed, using fallback:', error);
      }
    }

    // Fallback tradicional
    const count_x = d3
      .scaleTime()
      .domain(d3.extent(line_chart_data, d => d[x_axis_prop]));

    const count_y = d3
      .scaleLinear()
      .domain([
        d3.min(line_chart_data, d => d[y_axis_prop] * 1.5 - d[y_axis_prop]),
        d3.max(line_chart_data, d => d[y_axis_prop]) * 1.25
      ]);

    scales.count = { x: count_x, y: count_y };
  }

  function setup_elements() {
    const g = svg.select(`.line-chart-${html_element}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-chart-${html_element}-container-bis`);
  }

  function update_scales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width - right / 2]);
    y.range([height, 0]);
  }

  async function draw_axes(g) {
    // Chunked axis rendering para evitar blocking
    await inpOptimizer.scheduleTask(() => {
      const axisX = d3
        .axisBottom(scales.count.x)
        .tickPadding(4)
        .tickFormat(d => {
          if (main_chart || html_element.includes('gas')) {
            return new Intl.DateTimeFormat('es-ES', {
              day: 'numeric',
              month: 'numeric'
            }).format(d);
          } else {
            return d.getFullYear();
          }
        })
        .ticks(5);

      g.select('.axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(axisX);
    }, 'high');

    await inpOptimizer.scheduleTask(() => {
      const axisY = d3
        .axisLeft(scales.count.y)
        .tickPadding(15)
        .tickFormat(d =>
          d < 0.1
            ? `${d3.format('.2n')(d)} €/kWh`
            : `${d3.format('.3n')(d)} €/kWh`
        )
        .tickSize(-width)
        .ticks(8);

      g.select('.axis-y')
        .transition()
        .duration(300) // Reducido de 450ms para mejor INP
        .ease(d3.easeLinear)
        .call(axisY);
    }, 'high');
  }

  async function update_chart(data) {
    const w = chart.node().offsetWidth;
    const h = 500;

    const {
      count: { x, y }
    } = scales;

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.line-chart-${html_element}-container`);

    g.attr('transform', `translate(${left},${top})`);

    g.append('rect').attr('class', `overlay overlay-${html_element}`);

    g.append('g')
      .attr('class', `focus focus-${html_element}`)
      .style('display', 'none')
      .append('line')
      .attr('class', `y-hover-line y-hover-line-${html_element}`)
      .attr('y2', 0)
      .attr('y1', height);

    const line = d3
      .line()
      .x(d => x(d[x_axis_prop]))
      .y(d => y(d[y_axis_prop]));

    update_scales(width, height);

    const container = chart.select(`.line-chart-${html_element}-container-bis`);

    // Chunked path rendering para datasets grandes
    await renderPathChunked(container, data, line, html_element);

    const focus = g.select(`.focus-${html_element}`);

    const overlay = g.select(`.overlay-${html_element}`);

    focus.select(`.y-hover-line-${html_element}`).attr('y2', height);

    focus
      .append('circle')
      .attr('class', `circle-focus-${html_element}`)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0);

    // Throttle mousemove para mejorar INP con debounce más agresivo
    const isMobile = width_mobile <= 764;
    const throttledMousemove = throttle(mousemove, isMobile ? 100 : 50); // Más agresivo para mejor INP

    overlay
      .attr('width', width)
      .attr('height', height)
      .style('will-change', 'transform') // Hint para optimización GPU
      .on(
        'mouseover',
        function () {
          requestAnimationFrame(() => {
            focus.style('display', null);
          });
        },
        { passive: true }
      )
      .on(
        'mouseout',
        function () {
          requestAnimationFrame(() => {
            focus.style('display', 'none');
            tooltip.style('opacity', 0);
          });
        },
        { passive: true }
      )
      .on('mousemove', throttledMousemove, { passive: true });

    function mousemove(event) {
      // Optimización: salir temprano si no hay datos
      if (!data || data.length === 0) return;

      // Optimización: usar try-catch para evitar errores que bloqueen el hilo
      try {
        const { layerX } = event;
        const x0 = x.invert(layerX - left);
        const i = bisec_date(data, x0, 1);

        // Validar índices antes de acceder a los datos
        if (i <= 0 || i >= data.length) return;

        const d0 = data[i - 1];
        const d1 = data[i];
        if (!d0 || !d1) return;

        const d = x0 - d0[x_axis_prop] > d1[x_axis_prop] - x0 ? d1 : d0;
        const position_left_tooltip = (w - tooltip.node().offsetWidth) / 2;

        const month_content = `<span class="tooltip-group-by-${html_element}-year">En ${
          month_names[d[x_axis_prop].getMonth()]
        } del ${d.year} el precio medio fue de <strong>${d[y_axis_prop].toFixed(
          3
        )} € kWh</strong></span>`;

        const day_content = `<span class="tooltip-group-by-${html_element}-year">El ${
          d.day
        } de ${month_names[d[x_axis_prop].getMonth()]} del ${
          d.year
        } el precio medio fue de <strong>${d[y_axis_prop].toFixed(
          3
        )} €/kWh</strong></span>`;

        const hour_content = `<span class="tooltip-group-by-${html_element}-year">El ${
          d.day
        } de ${month_names[d[x_axis_prop].getMonth()]} del ${d.year} a las ${
          d.hora
        }:00 el precio fue de <strong>${d[y_axis_prop].toFixed(
          3
        )} €/kWh</strong></span>`;

        const day_week_content = `<span class="tooltip-group-by-${html_element}-year">El ${
          d.day_of_week
        }
       ${d.day} de ${month_names[d[x_axis_prop].getMonth()]} de ${d.year}
      el precio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`;

        const main_week_linechart = d.dia
          ? `<span class="tooltip-group-by-${html_element}-year">El ${d.dia.getDate()} de ${
              month_names[d[x_axis_prop].getMonth()]
            }
       a las ${d.dia.getHours()}:00
      el precio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`
          : '';

        const gas_hour_linechart = d.dia
          ? `<span class="tooltip-group-by-${html_element}-year">El ${d.dia.getDate()} de ${
              month_names[d[x_axis_prop].getMonth()]
            }
       a las ${d.dia.getHours()}:00
      el precio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`
          : '';

        const gas_day_linechart = `<span class="tooltip-group-by-${html_element}-year">El
       ${d.day} de ${month_names[d[x_axis_prop].getMonth()]} de ${d.year}
      el precio medio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`;

        const gas_month_linechart = `<span class="tooltip-group-by-${html_element}-year">En ${
          month_names[d[x_axis_prop].getMonth()]
        } del ${d.year} el precio medio fue de <strong>${d[y_axis_prop].toFixed(
          3
        )} € kWh</strong></span>`;

        tooltip
          .style('opacity', 1)
          .html(
            html_element === 'month-price'
              ? month_content
              : html_element === 'day-price' ||
                html_element === 'day-price-last-year'
              ? day_content
              : html_element === 'hour-price'
              ? hour_content
              : html_element === 'day-week-price'
              ? day_week_content
              : html_element === 'main-line-price'
              ? main_week_linechart
              : html_element === 'hour-price-gas'
              ? gas_hour_linechart
              : html_element === 'day-price-gas'
              ? gas_day_linechart
              : html_element === 'month-price-gas'
              ? gas_month_linechart
              : ''
          )
          .style('top', () => (width_mobile > 764 ? '5%' : ' 0%'))
          .style('left', () =>
            width_mobile > 764 ? `${position_left_tooltip}px` : '49%'
          );

        // Batch DOM updates con validación y GPU optimization
        const xPos = x(d[x_axis_prop]);
        const yPos = y(d[y_axis_prop]);

        // Validar posiciones para evitar valores NaN que causen reflows
        if (isNaN(xPos) || isNaN(yPos)) return;

        // Batch multiple DOM updates en single rAF
        requestAnimationFrame(() => {
          const focusElements = {
            line: focus.select(`.y-hover-line-${html_element}`),
            circle: focus.select(`.circle-focus-${html_element}`)
          };

          // Usar transform3d para mejor GPU acceleration
          focusElements.line
            .style('transform', `translate3d(${xPos}px, 0px, 0px)`)
            .attr('y1', yPos);

          focusElements.circle
            .style('transform', `translate3d(${xPos}px, ${yPos}px, 0px)`)
            .attr('r', 3);
        });
      } catch (error) {
        console.warn('Error in mousemove handler:', error);
      }
    }

    await draw_axes(g);
  }

  async function handle_select() {
    let select_values =
      html_element === 'day-week-price'
        ? day_names
        : [...new Set(line_chart_data.map(({ hora }) => hora))];

    select_values =
      html_element === 'day-week-price'
        ? select_values
        : select_values.filter(hora => hora !== '24');

    const select_element = d3.select(`#select-${html_element}`);

    select_element
      .selectAll('option')
      .data(select_values)
      .enter()
      .append('option')
      .attr('class', `select-${html_element}-options`)
      .attr('value', d => d)
      .text(d => (html_element === 'day-week-price' ? d : `${d}:00`));

    document
      .querySelectorAll(`.select-${html_element}-options`)
      .forEach(option => {
        if (option.value === selected_value) {
          option.selected = true;
        }
      });

    line_chart_data_filter =
      html_element === 'day-week-price'
        ? line_chart_data.filter(
            ({ day_of_week }) => day_of_week === selected_value
          )
        : line_chart_data.filter(({ hora }) => hora === selected_value);

    setup_elements();
    await setup_scales();
    await update_chart(line_chart_data_filter);

    select_element.on('change', async function () {
      const selected_value = d3
        .select(`#select-${html_element}`)
        .property('value');

      line_chart_data_filter =
        html_element === 'day-week-price'
          ? line_chart_data.filter(
              ({ day_of_week }) => day_of_week === selected_value
            )
          : line_chart_data.filter(({ hora }) => hora === selected_value);

      await setup_scales();
      await update_chart(line_chart_data_filter);
    });
  }

  async function resize() {
    const update_data = select_html ? line_chart_data_filter : line_chart_data;
    await update_chart(update_data);
  }

  async function load_data() {
    try {
      // Cache check primero
      const cacheKey = `${data_chart}_${html_element}_${selected_value || ''}`;
      if (chartDataCache.has(cacheKey)) {
        const cachedResult = chartDataCache.get(cacheKey);
        line_chart_data = cachedResult.data;
        await initializeChart();
        return;
      }

      const data = await d3.json(data_chart);

      // Usar worker para preprocessing de datos grandes
      let processedResult;
      if (data.length > 100) {
        try {
          processedResult = await d3WorkerManager.processLineChartData(data, {
            xAxisProp: x_axis_prop,
            yAxisProp: y_axis_prop,
            sortData: true
          });
          line_chart_data = processedResult.data;
        } catch (error) {
          console.warn('Worker processing failed, using fallback:', error);
          line_chart_data = data.sort(
            (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
          );
        }
      } else {
        line_chart_data = data.sort(
          (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
        );
      }

      // Cache resultado
      if (chartDataCache.size >= MAX_CACHE_SIZE) {
        const firstKey = chartDataCache.keys().next().value;
        chartDataCache.delete(firstKey);
      }
      chartDataCache.set(cacheKey, {
        data: line_chart_data,
        timestamp: Date.now()
      });

      await initializeChart();
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }

  async function initializeChart() {
    if (!select_html) {
      if (main_chart) {
        await chunkedTask(
          line_chart_data,
          d => {
            d[y_axis_prop] = d[y_axis_prop] / 1000;

            // Verificar tipo antes de procesar fecha
            if (typeof d[x_axis_prop] === 'string') {
              d[x_axis_prop] = new Date(
                `${d[x_axis_prop].split('/')[1]}/${
                  d[x_axis_prop].split('/')[0]
                }/${d[x_axis_prop].split('/')[2]}`
              );
            } else if (!(d[x_axis_prop] instanceof Date)) {
              d[x_axis_prop] = new Date(d[x_axis_prop]);
            }

            if (d.hora && typeof d.hora === 'string') {
              d[x_axis_prop].setHours(
                d[x_axis_prop].getHours() + parseInt(d.hora.split('-')[0])
              );
            }
          },
          { chunkSize: 50 }
        );
        line_chart_data.sort(
          (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
        );
      } else if (html_element === 'hour-price-gas') {
        await chunkedTask(
          line_chart_data,
          d => {
            // Verificar tipo antes de procesar fecha
            if (typeof d[x_axis_prop] === 'string') {
              d.day = d[x_axis_prop].split('/')[0];
              d.year = d[x_axis_prop].split('/')[2];
              d[x_axis_prop] = new Date(
                `${d[x_axis_prop].split('/')[1]}/${
                  d[x_axis_prop].split('/')[0]
                }/${d[x_axis_prop].split('/')[2]}`
              );
            } else if (!(d[x_axis_prop] instanceof Date)) {
              d[x_axis_prop] = new Date(d[x_axis_prop]);
              d.day = d[x_axis_prop].getDate();
              d.year = d[x_axis_prop].getFullYear();
            }
            d[x_axis_prop].setHours(d[x_axis_prop].getHours() + d.hora);
          },
          { chunkSize: 50 }
        );
        line_chart_data.sort(
          (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
        );
        setup_elements();
        await setup_scales();
        await update_chart(line_chart_data);
      } else {
        await chunkedTask(
          line_chart_data,
          d => {
            d[y_axis_prop] =
              html_element === 'day-price-gas' ||
              html_element === 'month-price-gas'
                ? d[y_axis_prop]
                : d[y_axis_prop] / 1000;
            d[x_axis_prop] = new Date(d[x_axis_prop]);
          },
          { chunkSize: 50 }
        );
      }

      setup_elements();
      await setup_scales();
      await update_chart(line_chart_data);
    } else {
      line_chart_data = await transform_data_day(line_chart_data);
      await handle_select();
    }

    // Calcular estadísticas de forma chunked
    const meanPrice = mean(line_chart_data.map(d => d[y_axis_prop]));
    const medianPrice = median(line_chart_data.map(d => d[y_axis_prop]));
  }

  async function transform_data_day(data) {
    let data_return = data;
    if (html_element === 'day-week-price') {
      await chunkedTask(
        data_return,
        d => {
          d[y_axis_prop] = d[y_axis_prop] / 1000;
          d[x_axis_prop] = new Date(d[x_axis_prop]);
        },
        { chunkSize: 50 }
      );

      data_return = data_return.map(({ date, ...rest }) => {
        return {
          date: date,
          day_of_week: new Date(date).toLocaleString('es-es', {
            weekday: 'long'
          }),
          ...rest
        };
      });
    } else {
      await chunkedTask(
        data_return,
        d => {
          d[y_axis_prop] = d[y_axis_prop] / 1000;

          if (d.hora && typeof d.hora === 'string') {
            d.hora = d.hora.split('-')[0];
          }

          // Verificar tipo antes de procesar fecha
          if (typeof d[x_axis_prop] === 'string') {
            d.day = d[x_axis_prop].split('/')[0];
            d.year = d[x_axis_prop].split('/')[2];
            d[x_axis_prop] = new Date(
              `${d[x_axis_prop].split('/')[1]}/${
                d[x_axis_prop].split('/')[0]
              }/${d[x_axis_prop].split('/')[2]}`
            );
          } else if (!(d[x_axis_prop] instanceof Date)) {
            d[x_axis_prop] = new Date(d[x_axis_prop]);
            d.day = d[x_axis_prop].getDate();
            d.year = d[x_axis_prop].getFullYear();
          }
        },
        { chunkSize: 50 }
      );
    }

    return data_return.sort(
      (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
    );
  }

  // Optimizar resize con throttling diferenciado para móvil/desktop
  const isMobile = window.innerWidth <= 768;
  const throttleDelay = isMobile ? 100 : 250;
  const throttledResize = throttle(resize, throttleDelay, { trailing: true });

  // Usar passive para mejor INP
  window.addEventListener('resize', throttledResize, { passive: true });

  // Cleanup en unload para evitar memory leaks
  window.addEventListener(
    'beforeunload',
    () => {
      window.removeEventListener('resize', throttledResize);
    },
    { once: true }
  );

  load_data();
}
