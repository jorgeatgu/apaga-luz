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

// Throttle function optimizada para mejorar INP en eventos frecuentes
function throttle(func, delay) {
  let lastCall = 0;
  let rafId = null;
  let lastArgs = null;

  return function (...args) {
    lastArgs = args;
    const now = Date.now();

    if (now - lastCall >= delay) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastCall = now;
      func.apply(this, lastArgs);
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

  function setup_scales() {
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

  function draw_axes(g) {
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

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

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
      .duration(450)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function update_chart(data) {
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

    container
      .selectAll(`.line-${html_element}`)
      .data([data])
      .join('path')
      .attr('class', `line-${html_element}`)
      .transition()
      .duration(200) // Reducir duración para mejor percepción de respuesta
      .ease(d3.easeLinear)
      .attrTween('d', function (d) {
        let previous = d3.select(this).attr('d');
        let current = line(d);
        // Solo animar si hay un path previo
        if (previous && previous !== 'null') {
          return d3.interpolatePath(previous, current);
        }
        return () => current;
      });

    const focus = g.select(`.focus-${html_element}`);

    const overlay = g.select(`.overlay-${html_element}`);

    focus.select(`.y-hover-line-${html_element}`).attr('y2', height);

    focus
      .append('circle')
      .attr('class', `circle-focus-${html_element}`)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0);

    // Throttle mousemove para mejorar INP con debounce en mobile
    const isMobile = width_mobile <= 764;
    const throttledMousemove = throttle(mousemove, isMobile ? 32 : 16); // 30fps mobile, 60fps desktop

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

      // No usar requestAnimationFrame aquí porque ya está en el throttle
      const { layerX } = event;
      const x0 = x.invert(layerX - left);
      const i = bisec_date(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
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

      // Batch DOM updates
      const xPos = x(d[x_axis_prop]);
      const yPos = y(d[y_axis_prop]);

      focus
        .select(`.y-hover-line-${html_element}`)
        .attr('transform', `translate(${xPos},0)`)
        .attr('y1', yPos);

      focus
        .select(`.circle-focus-${html_element}`)
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('r', 3);
    }

    draw_axes(g);
  }

  function handle_select() {
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
    setup_scales();
    update_chart(line_chart_data_filter);

    select_element.on('change', function () {
      const selected_value = d3
        .select(`#select-${html_element}`)
        .property('value');

      line_chart_data_filter =
        html_element === 'day-week-price'
          ? line_chart_data.filter(
              ({ day_of_week }) => day_of_week === selected_value
            )
          : line_chart_data.filter(({ hora }) => hora === selected_value);

      setup_scales();
      update_chart(line_chart_data_filter);
    });
  }

  function resize() {
    const update_data = select_html ? line_chart_data_filter : line_chart_data;
    update_chart(update_data);
  }

  function load_data() {
    d3.json(data_chart).then(data => {
      line_chart_data = data.sort(
        (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
      );

      if (!select_html) {
        if (main_chart) {
          line_chart_data.forEach(d => {
            d[y_axis_prop] = d[y_axis_prop] / 1000;
            d[x_axis_prop] = new Date(
              `${d[x_axis_prop].split('/')[1]}/${
                d[x_axis_prop].split('/')[0]
              }/${d[x_axis_prop].split('/')[2]}`
            );
            d[x_axis_prop].setHours(
              d[x_axis_prop].getHours() + d.hora.split('-')[0]
            );
          });
          line_chart_data = data.sort(
            (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
          );
        } else if (html_element === 'hour-price-gas') {
          line_chart_data.forEach(d => {
            d.day = d[x_axis_prop].split('/')[0];
            d.year = d[x_axis_prop].split('/')[2];
            d[x_axis_prop] = new Date(
              `${d[x_axis_prop].split('/')[1]}/${
                d[x_axis_prop].split('/')[0]
              }/${d[x_axis_prop].split('/')[2]}`
            );
            d[x_axis_prop].setHours(d[x_axis_prop].getHours() + d.hora);
          });
          line_chart_data = data.sort(
            (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
          );
          setup_elements();
          setup_scales();
          update_chart(line_chart_data);
        } else {
          line_chart_data.forEach(d => {
            d[y_axis_prop] =
              html_element === 'day-price-gas' ||
              html_element === 'month-price-gas'
                ? d[y_axis_prop]
                : d[y_axis_prop] / 1000;
            d[x_axis_prop] = new Date(d[x_axis_prop]);
          });
        }

        setup_elements();
        setup_scales();
        update_chart(line_chart_data);
      } else {
        line_chart_data = transform_data_day(line_chart_data);
        handle_select();
      }

      let meanPrice = mean(line_chart_data.map(d => d[y_axis_prop]));
      let medianPrice = median(line_chart_data.map(d => d[y_axis_prop]));
    });
  }

  function transform_data_day(data) {
    let data_return = data;
    if (html_element === 'day-week-price') {
      data_return.forEach(d => {
        d[y_axis_prop] = d[y_axis_prop] / 1000;
        d[x_axis_prop] = new Date(d[x_axis_prop]);
      });

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
      data_return.forEach(d => {
        d[y_axis_prop] = d[y_axis_prop] / 1000;
        d.hora = d.hora.split('-')[0];
        d.day = d[x_axis_prop].split('/')[0];
        d.year = d[x_axis_prop].split('/')[2];
        d[x_axis_prop] = new Date(
          `${d[x_axis_prop].split('/')[1]}/${d[x_axis_prop].split('/')[0]}/${
            d[x_axis_prop].split('/')[2]
          }`
        );
      });
    }

    return data_return.sort(
      (a, b) => new Date(a[x_axis_prop]) - new Date(b[x_axis_prop])
    );
  }

  window.addEventListener('resize', resize);

  load_data();
}
