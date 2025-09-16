import './../styles/styles.css';
import datos from '../../public/group-by-month.json';
import { Datepicker } from 'vanillajs-datepicker';
import es from 'vanillajs-datepicker/locales/es';
import { throttle } from './performance-utils.js';
Object.assign(Datepicker.locales, es);
const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'Junio',
  'julio',
  'agosto',
  'septiembre',
  'octuber',
  'November',
  'December'
];

/*const datePickerMonthPrice = document.getElementById('datepicker-month-price');
datePickerMonthPrice.addEventListener("changeDate", (event) => {
  const { detail: { date } } = event
  const getNumberMonth = date.getMonth() + 1
  const getNumberYear = date.getFullYear()

});

const datepicker = new Datepicker(datePickerMonthPrice, {
  startView: 1,
  pickLevel: 1,
  language: "es"
});
*/
import { select, selectAll } from 'd3-selection';
import { min, max, extent, bisector } from 'd3-array';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { json, csv } from 'd3-fetch';
import { easeLinear } from 'd3-ease';
import { format } from 'd3-format';
import { interpolatePath } from 'd3-interpolate-path';
import { timeFormat, timeParse } from 'd3-time-format';
import 'd3-transition';

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
  interpolatePath,
  timeFormat,
  timeParse,
  extent,
  csv
};

function lineChart(dataChart, element) {
  const margin = { top: 16, right: 16, bottom: 24, left: 96 };
  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-chart-${element}`);
  const svg = chart.select('svg');
  let scales = {};
  let lineChartData;
  const parseTime = d3.timeParse('%d-%b-%y');
  const bisectDate = d3.bisector(d => d.fecha).left;
  const tooltipGroupByMonth = chart
    .append('div')
    .attr('class', 'tooltip tooltip-group-by-month')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain(d3.extent(lineChartData, d => d.fecha));

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(lineChartData, d => d.averagePrice * 1.5 - d.averagePrice),
        d3.max(lineChartData, d => d.averagePrice) * 1.25
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.line-chart-${element}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-chart-${element}-container-bis`);
  }

  function updateScales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3.axisBottom(scales.count.x).tickPadding(7).ticks(9);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickPadding(15)
      .tickFormat(d => {
        if (d < 0.1) {
          return d3.format('.2n')(d) + ' €/kWh';
        } else {
          return d3.format('.3n')(d) + ' €/kWh';
        }
      })
      .tickSize(-width)
      .ticks(8);

    g.select('.axis-y')
      .transition()
      .duration(450)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function updateChart(data) {
    const w = chart.node().offsetWidth;
    const h = 500;

    const { left, right, top, bottom } = margin;

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.line-chart-${element}-container`);

    g.attr('transform', `translate(${left},${top})`);

    g.append('rect').attr('class', 'overlay-dos');

    g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0);

    const line = d3
      .line()
      .x(d => scales.count.x(d.fecha))
      .y(d => scales.count.y(d.averagePrice));

    updateScales(width, height);

    const container = chart.select(`.line-chart-${element}-container-bis`);

    container
      .selectAll('.line')
      .data([data])
      .join('path')
      .attr('class', 'line')
      .attr('d', d => line(d));

    const focus = g.select('.focus');

    const overlay = g.select('.overlay-dos');

    focus.select('.x-hover-line').attr('y2', height);

    overlay
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', function () {
        focus.style('display', null);
      })
      .on('mouseout', function () {
        focus.style('display', 'none');
        tooltipGroupByMonth.style('opacity', 0);
      })
      .on('mousemove', mousemove);

    function mousemove(event) {
      const { layerX } = event;
      const x0 = scales.count.x.invert(layerX - left);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0.fecha > d1.fecha - x0 ? d1 : d0;

      tooltipGroupByMonth
        .style('opacity', 1)
        .html(
          `<span class="tooltip-group-by-month-year">El precio medio fue de ${d.averagePrice.toFixed(
            3
          )} €/kWh</span>`
        )
        .style('top', '5%')
        .style('left', '35%');

      focus
        .select('.x-hover-line')
        .attr('transform', `translate(${scales.count.x(d.fecha)},0)`);
    }

    drawAxes(g);
  }

  function resize() {
    updateChart(lineChartData);
  }

  function loadData() {
    d3.json(dataChart).then(data => {
      data.sort((a, b) => parseFloat(a.year) - parseFloat(b.year));
      data.forEach(d => {
        d.averagePrice = d.averagePrice / 1000;
        d.fecha = new Date(d.date);
      });

      lineChartData = data;
      setupElements();
      setupScales();
      updateChart(lineChartData);
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

lineChart('../../public/group-by-month.json', 'month-price');
