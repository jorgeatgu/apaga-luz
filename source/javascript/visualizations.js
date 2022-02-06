import './../styles/styles.css';
import { lineChart } from './lineChart.js';
import data from '../../public/data/all_prices.json';

const user_hour = new Date().getHours();
const get_string_hour = user_hour < 10 ? `0${user_hour}` : user_hour;

const line_chart_by_month_options = {
  html_element: 'month-price',
  x_axis_prop: 'date',
  y_axis_prop: 'averagePrice',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

const line_chart_by_day_options = {
  html_element: 'day-price',
  x_axis_prop: 'date',
  y_axis_prop: 'price',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

const line_chart_by_hour_options = {
  html_element: 'hour-price',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

const scatter_plot_options = {
  html_element: 'hour-price',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 96
  }
};

lineChart(
  '../../public/data/group_prices_by_month.json',
  line_chart_by_month_options
);
lineChart(
  '../../public/data/group_prices_by_day.json',
  line_chart_by_day_options
);
lineChart(
  '../../public/data/all_prices.json',
  line_chart_by_hour_options,
  get_string_hour.toString()
);
