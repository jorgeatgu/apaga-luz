import './../styles/styles.css';
import data_tomorrow from '/public/data/tomorrow_price.json';
import data_tomorrow_omie from '/public/data/omie_data.json';
import { table_price_tomorrow, remove_tables_tomorrow } from './table.js';

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
const HALF_PAST_EIGHT_MINUTES = 1230;
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};

const get_day_from_data_omie = +data_tomorrow_omie[0].day;
const get_month_from_data_omie = +data_tomorrow_omie[0].month;
const its_time_to_show_the_data_from_esios =
  user_hour * 60 + +user_minutes >= HALF_PAST_EIGHT_MINUTES && user_hour < 24;
const its_time_to_show_the_content =
  user_hour * 60 + +user_minutes >= 810 && user_hour < 24;
const its_the_right_day =
  get_day_from_data_omie === tomorrow.getDate() &&
  get_month_from_data_omie === tomorrow.getMonth() + 1;

const filter_data_tomorrow_omie = data_tomorrow_omie.filter(
  ({ price }) => price
);

let filter_data_tomorrow = its_time_to_show_the_data_from_esios
  ? data_tomorrow
  : filter_data_tomorrow_omie;

const data_source_element = document.getElementById('table-next-day-data');
const data_source = its_time_to_show_the_data_from_esios ? 'ESIOS' : 'OMIE';

filter_data_tomorrow = filter_data_tomorrow.sort(
  ({ price: a }, { price: b }) => a - b
);

const container_table_tomorrow = document.querySelector('.table-next-day');
filter_data_tomorrow = filter_data_tomorrow.map(({ price, ...rest }) => {
  return {
    price: price.toFixed(3),
    ...rest
  };
});

for (let [index, element] of filter_data_tomorrow.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

order_table_tomorrow_by_price();
if (its_time_to_show_the_content && its_the_right_day) {
  container_table_tomorrow.style.display = 'grid';
  data_source_element.textContent = `Los datos de los precios son de la subasta de: ${data_source}`;
} else {
  const get_warning_id = document.getElementById('warning-tomorrow-data');
  get_warning_id.textContent = `Todavía no hay datos disponibles para mañana: ${tomorrow.toLocaleDateString(
    'es-ES',
    options
  )}`;

  container_table_tomorrow.style.display = 'none';
}

function order_table_tomorrow_by_price() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ price: a }, { price: b }) => a - b
  );

  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

function order_table_tomorrow_by_hour() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
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

const text_whatsApp = `whatsapp://send?text=Aquí puedes consultar el precio de la luz de mañana ${tomorrow.toLocaleDateString(
  'es-ES',
  options
)} https://www.apaga-luz.com/precio-luz-manana/?utm_source=whatsapp_mnn`;
const button_whatsApp = document.getElementById('btn-whatsapp-manana');
button_whatsApp.href = text_whatsApp;
