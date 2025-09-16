import { select, selectAll } from 'd3-selection';
import { min, max, extent } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { json } from 'd3-fetch';
import { easeQuad } from 'd3-ease';
import 'd3-transition';
import { throttle } from './performance-utils.js';

const d3 = {
  select,
  selectAll,
  min,
  max,
  extent,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft,
  json,
  easeQuad
};

export function scatterPlot(dataChart, scatterOptions) {
  const {
    html_element,
    x_axis_prop,
    y_axis_prop,
    margin: { top, right, bottom, left }
  } = scatterOptions;

  let width = 0;
  let height = 0;
  let scatterData;
  const chart = d3.select(`.scatter-${html_element}`);
  const svg = chart.select('svg');
  const scales = {};

  const tooltip = chart
    .append('div')
    .attr('class', 'tooltip tooltip-under-over')
    .attr('id', 'tooltip-scatter')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain(d3.extent(scatterData, d => d[x_axis_prop]));

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(scatterData, d => d[y_axis_prop] * 1.5 - d[y_axis_prop]),
        d3.max(scatterData, d => d[y_axis_prop]) * 1.25
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.scatter-${html_element}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `scatter-${html_element}-container-bis`);
  }

  function updateScales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width]);
    y.range([height, 20]);
  }

  function drawAxes(g) {
    const axisX = d3.axisBottom(scales.count.x).tickPadding(7).ticks(9);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => d)
      .tickSize(-width)
      .ticks(5);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(scatterData) {
    const w = chart.node().offsetWidth;
    const h = 600;

    const {
      count: { x, y }
    } = scales;

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.scatter-${html_element}-container`);

    g.attr('transform', `translate(${left},${top})`);

    updateScales(width, height);

    const container = chart.select(`.scatter-${html_element}-container-bis`);

    container
      .selectAll('.scatter-circles')
      .data(scatterData)
      .join(
        enter =>
          enter
            .append('circle')
            .attr('cx', d => x(d[x_axis_prop]))
            .attr('cy', d => y(d[y_axis_prop]))
            .attr('r', 0),
        update => update.attr('r', 3),
        exit =>
          exit
            .attr('cx', d => x(d[x_axis_prop]))
            .attr('cy', d => y(d[y_axis_prop]))
            .attr('r', 0)
      )
      .attr('class', `scatter-${html_element}-circles scatter-circles`)
      .transition()
      .duration(600)
      .ease(d3.easeQuad)
      .attr('cx', d => x(d[x_axis_prop]))
      .attr('cy', d => y(d[y_axis_prop]))
      .attr('r', 3)
      .attr('fill', 'var(--red-light)')
      .attr('fill-opacity', '.05');

    drawAxes(g);
  }

  function resize() {
    updateChart(scatterData);
  }

  function loadData() {
    d3.json(dataChart).then(data => {
      scatterData = data.sort((a, b) => {
        const xDateX = new Date(a[x_axis_prop]);
        const xDateY = new Date(b[x_axis_prop]);
        return xDateX - xDateY;
      });
      scatterData.forEach(d => {
        d[y_axis_prop] = d[y_axis_prop] / 1000;
        d[x_axis_prop] = new Date(
          d[x_axis_prop].split('/')[1] +
            '/' +
            d[x_axis_prop].split('/')[0] +
            '/' +
            d[x_axis_prop].split('/')[2]
        );
      });

      scatterData = scatterData.sort((a, b) => {
        const xDateX = new Date(a[x_axis_prop]);
        const xDateY = new Date(b[x_axis_prop]);
        return xDateX - xDateY;
      });

      setupElements();
      setupScales();
      updateChart(scatterData);
    });
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

  loadData();
}
