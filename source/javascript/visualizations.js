import './../styles/styles.css';
import { lineChart } from './lineChart.js';

let getHourSelected = '20';

const lineChartByMonthOptions = {
  html_element: 'month-price',
  xAxisProp: 'date',
  yAxisProp: 'averagePrice',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

const lineChartByDayOptions = {
  html_element: 'day-price',
  xAxisProp: 'date',
  yAxisProp: 'price',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

const lineChartByHourOptions = {
  html_element: 'hour-price',
  xAxisProp: 'dia',
  yAxisProp: 'precio',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

lineChart('../../public/data/group-by-month.json', lineChartByMonthOptions);
lineChart('../../public/data/group_prices_by_day.json', lineChartByDayOptions);
lineChart(
  '../../public/data/all_prices.json',
  lineChartByHourOptions,
  getHourSelected
);
