import './../styles/styles.css';
import { lineChart } from './lineChart.js';

const day_names = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo'
];

const user_hour = new Date().getHours();
const user_day = new Date();
const day_name = day_names[user_day.getDay() - 1];
const get_string_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
const width_mobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

const line_chart_by_month_options = {
  html_element: 'month-price',
  x_axis_prop: 'date',
  y_axis_prop: 'averagePrice',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_by_day_options = {
  html_element: 'day-price',
  x_axis_prop: 'date',
  y_axis_prop: 'price',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_by_hour_options = {
  html_element: 'hour-price',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  select_html: true,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_by_day_of_week_options = {
  html_element: 'day-week-price',
  x_axis_prop: 'date',
  y_axis_prop: 'price',
  select_html: true,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
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
lineChart(
  '../../public/data/group_prices_by_day.json',
  line_chart_by_day_of_week_options,
  day_name
);
