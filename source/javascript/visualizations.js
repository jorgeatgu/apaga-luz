import './../styles/styles.css';
import { line_chart } from './line_chart.js';
import { area_stacked } from './area_stacked.js';
/*import { area_stacked_json } from './area_stacked_json.js';*/
import {
  width_mobile,
  month_names,
  last_n_days,
  day_names_us
} from './utils.js';
import data_historic_today from '/public/data/historic_today_price.json';
import data_last_week from '/public/data/last_week_price.json';
import { create_new_table } from './table.js';
import { initNavigation } from './navigation.js';

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
    left: width_mobile < 763 ? 48 : 96
  }
};

const area_stacked_generation = {
  html_element: 'energy-generation',
  x_axis_prop: 'date',
  select_html: false,
  margin: {
    top: 48,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 48 : 96
  }
};

const get_table_historic_date = document.getElementById('js-table-date');
get_table_historic_date.textContent = ` el ${user_day.getDate()} de ${
  month_names[user_day.getMonth()]
}`;

const line_chart_by_day_of_month_options = {
  html_element: 'main-line-price',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  select_html: false,
  main_chart: true,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

const line_chart_group_by_day_options = {
  html_element: 'day-price-last-year',
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

line_chart('/data/last_year_group_price.json', line_chart_group_by_day_options);
line_chart('/data/last_month_price.json', line_chart_by_day_of_month_options);
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

/*area_stacked_json(area_stacked_generation);*/
create_new_table(data_historic_today, 'table-year', 'year');
create_new_table(data_last_week, 'table-week', 'day');

// Inicializar navegación usando el módulo centralizado
document.addEventListener(
  'DOMContentLoaded',
  function () {
    initNavigation();
  },
  { once: true }
);
