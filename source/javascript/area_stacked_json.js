import { select, selectAll } from 'd3-selection';
import { min, max, bisector, extent } from 'd3-array';
import {
  curveCardinal,
  area,
  stack,
  stackOrderAppearance,
  stackOffsetSilhouette
} from 'd3-shape';
import { scaleTime, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { json } from 'd3-fetch';
import { format } from 'd3-format';
import data_generation from '/public/data/generacion-energia-comunidad.json';
import { throttle } from './performance-utils.js';

const d3 = {
  select,
  selectAll,
  min,
  max,
  bisector,
  extent,
  curveCardinal,
  area,
  stack,
  stackOrderAppearance,
  scaleTime,
  scaleLinear,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  json,
  format
};

export function area_stacked_json(element_options) {
  const {
    html_element,
    x_axis_prop,
    y_axis_prop,
    select_html,
    margin: { top, right, bottom, left: marginLeft }
  } = element_options;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.area-stacked-${html_element}`);
  const svg = chart.select('svg');
  const scales = {};
  let area_stacked_data;
  const exclude_keys = [x_axis_prop, 'ccaa', 'Generación total', 'percentage'];
  let get_keys;
  const bisec_date = d3.bisector(d => d[x_axis_prop]).left;
  const area_stacked_tooltip = chart
    .append('div')
    .attr('class', 'tooltip tooltip-area-stack')
    .style('opacity', 0);

  function setup_scales() {
    const stacked = d3.stack().keys(get_keys).order(d3.stackOrderAppearance)(
      area_stacked_data
    );

    const countX = d3
      .scaleTime()
      .domain(d3.extent(area_stacked_data, d => d[x_axis_prop]));

    const countY = d3
      .scaleLinear()
      .domain([0, d3.max(stacked, d => d3.max(d, d => d[1]))]);

    scales.count = { x: countX, y: countY };
  }

  function setup_elements() {
    const g = svg.select(`.area-stacked-${html_element}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `area-stacked-${html_element}-container-bis`);
  }

  function update_scales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width]);
    y.range([height, 0]);
  }

  function draw_axes(g) {
    const {
      count: { x, y }
    } = scales;
    const axis_x = d3
      .axisBottom(x)
      .tickFormat(d =>
        new Intl.DateTimeFormat('es-ES', {
          year: 'numeric'
        }).format(d)
      )
      .tickPadding(7);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axis_x);

    const axis_y = d3
      .axisLeft(y)
      .tickFormat(
        d =>
          new Intl.NumberFormat('es-ES', {
            maximumSignificantDigits: 3
          }).format(d) + ' GW'
      )
      .tickSizeInner(-width)
      .ticks(7);

    g.select('.axis-y').transition().duration(600).call(axis_y);
  }

  function update_chart(area_stacked_data) {
    const w = chart.node().offsetWidth;
    const h = 600;

    width = w - marginLeft - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.area-stacked-${html_element}-container`);

    g.attr('transform', `translate(${marginLeft},${top})`);

    g.append('rect').attr('class', 'overlay-dos');

    g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0);

    const area = d3
      .area()
      .x(d => scales.count.x(d.data[x_axis_prop]))
      .y0(d => scales.count.y(d[0]))
      .y1(d => scales.count.y(d[1]))
      .curve(d3.curveCardinal.tension(0.3));

    const stack = d3.stack().offset(d3.stackOffsetSilhouette).keys(get_keys);

    const stacked_data = stack(area_stacked_data);
    const colors = d3
      .scaleOrdinal()
      .domain(
        [...new Set(data_generation.flatMap(Object.keys))].filter(
          column => !exclude_keys.includes(column)
        )
      )
      .range([
        '#C54073',
        '#111',
        'hsl(189,60.3%,52.5%)',
        'hsl(24,94.0%,50.0%)',
        'hsl(358,75.0%,59.0%)',
        '#5A1C7C',
        'hsl(131,41.0%,46.5%)',
        'hsl(48,100%,46.1%)',
        'hsl(211,100%,43.2%)',
        '#009392',
        '#39b185',
        '#9ccb86',
        '#e9e29c',
        '#eeb479',
        '#e88471',
        '#cf597e'
      ]);

    update_scales(width, height);

    const container = chart.select(
      `.area-stacked-${html_element}-container-bis`
    );

    container
      .selectAll('.area-stack')
      .data(stacked_data)
      .join('path')
      .attr('fill', d => colors(d.key))
      .transition()
      .duration(600)
      .attr('d', area)
      .attr('class', 'area-stack')
      .attr('id', d => d.key);

    container.selectAll('.area-stacked-legend').remove();

    container
      .selectAll('.area-stacked-legend')
      .data(d3.stack().keys(get_keys)(stacked_data))
      .join(
        enter => {
          const g = enter
            .append('g')
            .attr('class', 'area-stacked-legend')
            .attr('fill', ({ key }) => colors(key));
          g.append('rect')
            .attr('y', -16)
            .attr('rx', 4)
            .attr('class', 'area-stacked-legend-rect')
            .attr('width', 8)
            .attr('height', 8);
          g.append('text')
            .attr('class', 'area-stacked-legend-text')
            .attr('x', 10)
            .attr('y', -8)
            .attr('fill', '#666')
            .text(({ key }) => key);
          return g;
        },
        update => update,
        exit => exit.remove()
      );

    let moveLegendsX = 0;
    container
      .selectAll('.area-stacked-legend')
      .attr('transform', function (d, i) {
        const element = select(this)._groups[0][0].getBBox();
        moveLegendsX += element.width + 2;
        const translateX = i === 0 ? 0 : moveLegendsX - element.width;
        return `translate(${translateX}, 0)`;
      });
    const focus = g.select('.focus');

    const overlay = g.select('.overlay-dos');

    focus.select('.x-hover-line').attr('y2', height);

    overlay
      .attr('width', w)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mouseover', function () {
        focus.style('display', null);
      })
      .on('mouseout', function () {
        focus.style('display', 'none');
        area_stacked_tooltip.style('opacity', 0);
      })
      .on('mousemove', mousemove);

    function mousemove(event) {
      const { layerX } = event;
      const w = chart.node().offsetWidth;
      const x0 = scales.count.x.invert(layerX - marginLeft);
      const i = bisec_date(area_stacked_data, x0, 1);
      const d0 = area_stacked_data[i - 1];
      const d1 = area_stacked_data[i];
      const d = x0 - d0[x_axis_prop] > d1[x_axis_prop] - x0 ? d1 : d0;
      const position_x = scales.count.x(d[x_axis_prop]) + marginLeft;
      const position_width_tooltip = position_x + 200;
      const position_right_tooltip = w - position_x;

      area_stacked_tooltip
        .style('opacity', 1)
        .html(function () {
          let rest_of_values = [];
          for (const key in d) {
            if (!exclude_keys.includes(key)) {
              const getColor = colors(key);
              const getKey = +d[key];
              let value = `<div id="${key}" class="tooltip-area-stack-grid"><span style="background-color: ${getColor}" class="tooltip-area-stack-grid-key">${key}:</span> <span  class="tooltip-area-stack-grid-value">${getKey
                .toFixed(2)
                .replace('.', ',')} GW</span></div>`;
              rest_of_values.push(value);
            }
          }
          rest_of_values = rest_of_values.join('');
          return `
            <span class="tooltip-area-stack-year">${new Intl.DateTimeFormat(
              'es-ES',
              { year: 'numeric' }
            ).format(d[x_axis_prop])}</span>
            ${rest_of_values}
            `;
        })
        .style('top', '0')
        .style('left', position_width_tooltip > w ? 'auto' : `${position_x}px`)
        .style(
          'right',
          position_width_tooltip > w ? position_right_tooltip + 'px' : 'auto'
        );

      focus
        .select('.x-hover-line')
        .attr('transform', `translate(${scales.count.x(d[x_axis_prop])},0)`);
    }

    draw_axes(g);
  }

  function resize() {
    update_chart(area_stacked_data);
  }

  function update_community() {
    const value_community = d3.select('#select-communities').property('value');
    area_stacked_data = data_generation.filter(
      ({ ccaa }) => ccaa === value_community
    );
    get_keys = [...new Set(area_stacked_data.flatMap(Object.keys))].filter(
      column => !exclude_keys.includes(column)
    );
    console.log('get_keys', get_keys);
    area_stacked_data.forEach(d => {
      d.date = new Date(d.date);
    });

    setup_scales();
    update_chart(area_stacked_data);
  }

  function menu_select_community() {
    const communities_name = [
      ...new Set(
        data_generation
          .map(({ ccaa }) => ccaa)
          .sort((a, b) => a.localeCompare(b))
      )
    ];
    const select_community = d3.select('#select-communities');

    select_community
      .selectAll('option')
      .data(communities_name)
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);

    select_community.on('change', function () {
      update_community();
    });
  }

  function load_data() {
    area_stacked_data = data_generation;

    area_stacked_data.forEach(d => {
      d.date = new Date(d.date);
    });

    area_stacked_data = area_stacked_data.filter(d => d.ccaa === 'Andalucía');

    get_keys = [...new Set(area_stacked_data.flatMap(Object.keys))].filter(
      column => !exclude_keys.includes(column)
    );

    setup_elements();
    setup_scales();
    menu_select_community();
    update_chart(area_stacked_data);
  }

  // Optimizar resize con throttling para mejor INP
  const isMobile = window.innerWidth <= 768;
  const throttleDelay = isMobile ? 100 : 250;
  const throttledResize = throttle(resize, throttleDelay, { trailing: true });

  window.addEventListener('resize', throttledResize, { passive: true });

  // Cleanup
  window.addEventListener(
    'beforeunload',
    () => {
      window.removeEventListener('resize', throttledResize);
    },
    { once: true }
  );

  load_data();
}
