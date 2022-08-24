import './../styles/styles.css';
import data_gas_omie from '/public/data/omie_compensacion_data.json';
import data_tomorrow_omie from '/public/data/omie_data.json';
import { table_price_tomorrow, remove_tables_tomorrow } from './table.js';
import { line_chart } from './line_chart.js';
import {
  width_mobile,
  month_names,
  last_n_days,
  day_names_us
} from './utils.js';

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

let user_hour = new Date().getHours();
let user_minutes = new Date().getMinutes();
let user_day = new Date();
user_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
user_minutes = user_minutes < 10 ? `0${user_minutes}` : user_minutes;

const TIME_OMIE_GAS = 845;
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};

const get_day_from_data_omie = +data_tomorrow_omie[0].day;
const get_month_from_data_omie = +data_tomorrow_omie[0].month;
const its_time_to_show_the_sum_compensation_gas =
  user_hour * 60 + +user_minutes >= TIME_OMIE_GAS && user_hour < 24;

let filter_data_tomorrow_omie = data_gas_omie.filter(({ price }) => price);
const data_source_element = document.getElementById('table-next-day-data');

filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
  ({ price: a }, { price: b }) => a - b
);

filter_data_tomorrow_omie = filter_data_tomorrow_omie.map(
  ({ price, ...rest }) => {
    return {
      price: price.toFixed(3),
      ...rest
    };
  }
);

for (let [index, element] of filter_data_tomorrow_omie.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

const container_table_tomorrow = document.querySelector('.table-next-day');
const check_the_day_in_data =
  get_day_from_data_omie === tomorrow.getDate() &&
  get_month_from_data_omie === tomorrow.getMonth() + 1;

if (its_time_to_show_the_sum_compensation_gas && check_the_day_in_data) {
  container_table_tomorrow.style.display = 'grid';
} else {
  const get_warning_id = document.getElementById('warning-tomorrow-data');
  get_warning_id.textContent = `Todavía no hay datos disponibles para mañana: ${tomorrow.toLocaleDateString(
    'es-ES',
    options
  )}`;

  container_table_tomorrow.style.display = 'none';
}

order_table_tomorrow_by_price();

function order_table_tomorrow_by_price() {
  filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
    ({ price: a }, { price: b }) => a - b
  );

  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(0, 12),
    '.table-next-day-grid-left',
    true
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(12, 24),
    '.table-next-day-grid-right',
    true
  );
}

function order_table_tomorrow_by_hour() {
  filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(0, 12),
    '.table-next-day-grid-left',
    true
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(12, 24),
    '.table-next-day-grid-right',
    true
  );
}

document.getElementById('order-price-next').addEventListener('click', () => {
  remove_tables_tomorrow();
  order_table_tomorrow_by_price();
});

document.getElementById('order-hour-next').addEventListener('click', () => {
  remove_tables_tomorrow();
  order_table_tomorrow_by_hour();
});

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
  html_element: 'hour-price-gas',
  x_axis_prop: 'dia',
  y_axis_prop: 'precio',
  select_html: false,
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: width_mobile < 763 ? 76 : 96
  }
};

/*line_chart('/data/group_prices_by_day.json', line_chart_by_day_options);*/
line_chart('/data/historic_compensacion_gas.json', line_chart_by_hour_options);
