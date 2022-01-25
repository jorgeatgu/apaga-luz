import './../css/styles.css';

import { lineChart } from './lineChart.js';

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

lineChart('../../public/group-by-month.json', lineChartByMonthOptions);
lineChart('../../public/group-by-day.json', lineChartByDayOptions);
