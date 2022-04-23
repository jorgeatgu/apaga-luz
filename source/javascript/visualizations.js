import './../styles/styles.css';
import { line_chart } from './line_chart.js';
import { area_stacked } from './area_stacked.js';
import { width_mobile, day_names_us } from './utils.js';

const user_hour = new Date().getHours();
const user_day = new Date();
const day_name = day_names_us[user_day.getDay()];
const get_string_hour = user_hour < 10 ? `0${user_hour}` : user_hour;

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

const area_stacked_consumption_options = {
  html_element: 'energy-consumption',
  x_axis_prop: 'year',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

line_chart('/data/group_prices_by_month.json', line_chart_by_month_options);
line_chart('/data/group_prices_by_day.json', line_chart_by_day_options);
line_chart(
  '/data/all_prices.json',
  line_chart_by_hour_options,
  get_string_hour.toString()
);
line_chart(
  '/data/group_prices_by_day.json',
  line_chart_by_day_of_week_options,
  day_name
);

area_stacked(
  '/data/owid-energy-spain-consumption.csv',
  area_stacked_consumption_options
);
