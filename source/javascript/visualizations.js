import './../styles/styles.css';
import { lineChart } from './lineChart.js';
import { createNewTable } from './table.js';
import data from '../../public/data/all_prices.json';

let getHourSelected = '00';

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

lineChart(
  '../../public/data/group_prices_by_month.json',
  lineChartByMonthOptions
);
lineChart('../../public/data/group_prices_by_day.json', lineChartByDayOptions);
lineChart(
  '../../public/data/all_prices.json',
  lineChartByHourOptions,
  getHourSelected
);

const filtered_data_table_by_day = data.filter(({ dia }) =>
  dia.includes('30/11/')
);

const last_n_days = nDays =>
  [...Array(nDays)].map((_, index) => {
    const dates = new Date();
    dates.setDate(dates.getDate() + 1 - index);
    return dates;
  });

let last_week_strings = last_n_days(7);
last_week_strings = last_week_strings.map(d => {
  const get_string_day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const get_string_month =
    d.getMonth() < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
  return `${get_string_day}/${get_string_month}/${d.getFullYear()}`;
});

const filtered_data_table_by_last_week = data.filter(day =>
  last_week_strings.includes(day.dia)
);

createNewTable(filtered_data_table_by_day, 'table-test', 'year');
createNewTable(filtered_data_table_by_last_week, 'table-test-week', 'day');
