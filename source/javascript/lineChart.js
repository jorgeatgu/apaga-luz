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

const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const dayNames = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo'
];

export function lineChart(dataChart, elementOptions, hourSelected = '') {
  const {
    html_element,
    x_axis_prop,
    y_axis_prop,
    margin: { top, right, bottom, left }
  } = elementOptions;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-chart-${html_element}`);
  const svg = chart.select('svg');
  let scales = {};
  let lineChartData;
  const bisectDate = d3.bisector(d => d[x_axis_prop]).left;
  const tooltip = chart
    .append('div')
    .attr('class', `tooltip tooltip-${html_element}`)
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain(d3.extent(lineChartData, d => d[x_axis_prop]));

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(lineChartData, d => d[y_axis_prop] * 1.5 - d[y_axis_prop]),
        d3.max(lineChartData, d => d[y_axis_prop]) * 1.25
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.line-chart-${html_element}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-chart-${html_element}-container-bis`);
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

    updateScales(width, height);

    const container = chart.select(`.line-chart-${html_element}-container-bis`);

    container
      .selectAll(`.line-${html_element}`)
      .data([data])
      .join('path')
      .attr('class', `line-${html_element}`)
      .transition()
      .duration(300)
      .ease(d3.easeLinear)
      .attrTween('d', function (d) {
        let previous = d3.select(this).attr('d');
        let current = line(d);
        return d3.interpolatePath(previous, current);
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

    overlay
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', function () {
        focus.style('display', null);
      })
      .on('mouseout', function () {
        focus.style('display', 'none');
      })
      .on('mousemove', mousemove);

    function mousemove(event) {
      const { layerX } = event;
      const x0 = x.invert(layerX - left);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0[x_axis_prop] > d1[x_axis_prop] - x0 ? d1 : d0;
      const position_left_tooltip = (w - tooltip.node().offsetWidth) / 2;

      const monthContent = `<span class="tooltip-group-by-${html_element}-year">En ${
        monthNames[d[x_axis_prop].getMonth()]
      } del ${d.year} el precio medio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`;

      const dayContent = `<span class="tooltip-group-by-${html_element}-year">El ${
        d.day
      } de ${monthNames[d[x_axis_prop].getMonth()]} del ${
        d.year
      } el precio medio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`;

      const hourContent = `<span class="tooltip-group-by-${html_element}-year">El ${
        d.day
      } de ${monthNames[d[x_axis_prop].getMonth()]} del ${d.year} a las ${
        d.hora
      }:00 el precio fue de <strong>${d[y_axis_prop].toFixed(
        3
      )} €/kWh</strong></span>`;

      tooltip
        .style('opacity', 1)
        .html(
          html_element === 'month-price'
            ? monthContent
            : html_element === 'day-price'
            ? dayContent
            : hourContent
        )
        .style('top', '5%')
        .style('left', `${position_left_tooltip}px`);

      focus
        .select(`.y-hover-line-${html_element}`)
        .attr('transform', `translate(${x(d[x_axis_prop])},0)`)
        .attr('y1', y(d[y_axis_prop]));

      focus
        .select(`.circle-focus-${html_element}`)
        .attr('cx', x(d[x_axis_prop]))
        .attr('cy', y(d[y_axis_prop]))
        .attr('r', 3);
    }

    drawAxes(g);
  }

  function menuSelectHour() {
    let selectHoursValues = [...new Set(lineChartData.map(({ hora }) => hora))];

    selectHoursValues = selectHoursValues.filter(hora => hora !== '24');
    const selectHours = d3.select('#select-hours');

    selectHours
      .selectAll('option')
      .data(selectHoursValues)
      .enter()
      .append('option')
      .attr('value', d => d)
      .attr('selected', d => (d === hourSelected ? true : false))
      .text(d => `${d}:00`);

    let lineChartDataFilter = lineChartData.filter(
      ({ hora }) => hora === hourSelected
    );
    setupElements();
    setupScales();
    updateChart(lineChartDataFilter);
    selectHours.on('change', function () {
      const hourSelectedValue = d3.select('#select-hours').property('value');

      lineChartDataFilter = lineChartData.filter(
        ({ hora }) => hora === hourSelectedValue
      );

      setupScales();
      updateChart(lineChartDataFilter);
    });
  }

  function resize() {
    updateChart(lineChartData);
  }

  function loadData() {
    d3.json(dataChart).then(data => {
      lineChartData = data.sort((a, b) => {
        const xDateX = new Date(a[x_axis_prop]);
        const xDateY = new Date(b[x_axis_prop]);
        return xDateX - xDateY;
      });
      console.log('lineChartData', lineChartData, html_element);
      if (!hourSelected) {
        lineChartData.forEach(d => {
          d[y_axis_prop] = d[y_axis_prop] / 1000;
          d[x_axis_prop] = new Date(d[x_axis_prop]);
        });

        setupElements();
        setupScales();
        updateChart(lineChartData);
      } else {
        lineChartData.forEach(d => {
          d[y_axis_prop] = d[y_axis_prop] / 1000;
          d.hora = d.hora.split('-')[0];
          d[x_axis_prop] = new Date(
            d[x_axis_prop].split('/')[1] +
              '/' +
              d[x_axis_prop].split('/')[0] +
              '/' +
              d[x_axis_prop].split('/')[2]
          );
        });

        lineChartData = lineChartData.sort((a, b) => {
          const xDateX = new Date(a[x_axis_prop]);
          const xDateY = new Date(b[x_axis_prop]);
          return xDateX - xDateY;
        });
        menuSelectHour();
      }

      let meanPrice = mean(lineChartData.map(d => d[y_axis_prop]));
      let medianPrice = median(lineChartData.map(d => d[y_axis_prop]));
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
