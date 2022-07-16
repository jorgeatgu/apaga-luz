import './../styles/styles.css';
import data_today from '/public/data/today_price.json';
import data_tomorrow_omie from '/public/data/omie_data.json';
import data_tomorrow from '/public/data/tomorrow_price.json';
import data_canary from '/public/data/canary_price.json';
import {
  reload_page,
  get_zone_color,
  width_mobile,
  day_names_us
} from './utils.js';

import {
  table_price,
  table_price_tomorrow,
  remove_tables,
  remove_tables_tomorrow
} from './table.js';

const options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};

const get_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

let user_hour = new Date().getHours();
let user_minutes = new Date().getMinutes();
let user_day = new Date();
const day_name = day_names_us[user_day.getDay()];

const is_user_from_canary =
  get_time_zone === 'Atlantic/Canary' && user_hour > 22 && user_hour < 24;
let data_prices = is_user_from_canary ? data_canary : data_today;

const [{ price }] = data_prices.filter(({ hour }) => +hour == user_hour);

user_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
user_minutes = user_minutes < 10 ? `0${user_minutes}` : user_minutes;

const price_element = document.getElementById('price');
const hours_element = document.getElementById('hours');
const minutes_element = document.getElementById('minutes');

price_element.textContent = `${price.toFixed(3)}`;
hours_element.textContent = user_hour;
minutes_element.textContent = user_minutes;

const main_element = document.getElementsByTagName('main')[0];
const menu_element = document.getElementsByTagName('nav')[0];

reload_page(user_minutes);

const filter_data_by_user_hour = data_prices.map(({ hour, price, ...rest }) => {
  return {
    hourHasPassed: +hour < user_hour ? true : false,
    price: price.toFixed(3),
    hour,
    ...rest
  };
});

let filter_data_today = filter_data_by_user_hour.sort(
  ({ price: a }, { price: b }) => a - b
);
/*This code is temporary. Hours are reordered based on prices, not Government nomenclature.*/
for (let [index, element] of filter_data_today.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

const [{ zone }] = filter_data_today.filter(({ hour }) => hour == user_hour);
main_element.style.backgroundColor = get_zone_color(zone);
menu_element.style.backgroundColor = get_zone_color(zone);

let type_of_order;

function order_by_price() {
  filter_data_today = filter_data_today.sort(
    ({ price: a }, { price: b }) => a - b
  );
  table_price(filter_data_today.slice(0, 12), '.container-table-price-left');
  table_price(filter_data_today.slice(12, 24), '.container-table-price-right');

  type_of_order = 'price';
}

function order_by_hour() {
  filter_data_today = filter_data_today.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price(filter_data_today.slice(0, 12), '.container-table-price-left');
  table_price(filter_data_today.slice(12, 24), '.container-table-price-right');
  type_of_order = 'hour';
}

order_by_hour();

document.getElementById('order-price').addEventListener('click', () => {
  remove_tables();
  order_by_price();
});

document.getElementById('order-hour').addEventListener('click', () => {
  remove_tables();
  order_by_hour();
});

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

let filter_data_tomorrow = data_tomorrow.sort(
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

const TWENTY_PAST_EIGHT_MINUTES = 1220;
const QUARTER_PAST_ONE = 790;
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const get_day_from_data_omie = +data_tomorrow_omie[0].day;
const get_month_from_data_omie = +data_tomorrow_omie[0].month;
const get_day_from_data_esios = +data_tomorrow[0].day.split('/')[0];
const get_month_from_data_esios = +data_tomorrow[0].day.split('/')[1];

const its_time_to_show_the_data_from_esios =
  user_hour * 60 + +user_minutes >= TWENTY_PAST_EIGHT_MINUTES && user_hour < 24;

const its_time_to_show_the_data_from_omie =
  user_hour * 60 + +user_minutes >= QUARTER_PAST_ONE &&
  user_hour < TWENTY_PAST_EIGHT_MINUTES;

const check_the_day_in_data_omie =
  get_day_from_data_omie === tomorrow.getDate() &&
  get_month_from_data_omie === tomorrow.getMonth() + 1;

const its_the_right_day =
  get_day_from_data_esios === tomorrow.getDate() &&
  get_month_from_data_esios === tomorrow.getMonth() + 1;

if (its_time_to_show_the_data_from_omie && check_the_day_in_data_omie) {
  const get_button_next_day = document.getElementById('button-prices-next-day');
  get_button_next_day.style.display = 'inline-block';
  get_button_next_day.textContent = `Ya están disponibles los precios de la luz para mañana, ${tomorrow.toLocaleDateString(
    'es-ES',
    options
  )}`;
}

if (its_time_to_show_the_data_from_esios && its_the_right_day) {
  container_table_tomorrow.style.display = 'grid';
  order_table_tomorrow_by_price();
} else {
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

document.getElementById('checkbox-hours').addEventListener('change', () => {
  if (type_of_order === 'price') {
    remove_tables();
    order_by_price();
  } else {
    remove_tables();
    order_by_hour();
  }
});

const text_whatsApp = `whatsapp://send?text=El precio de la luz a las ${user_hour}:${user_minutes} es de ${price.toFixed(
  3
)} €/kWh https://www.apaga-luz.com/?utm_source=whatsapp`;
const button_whatsApp = document.getElementById('btn-whatsapp');
button_whatsApp.href = text_whatsApp;

let root = document.documentElement;

document.getElementById('color-blindness').addEventListener('change', e => {
  const {
    target: { checked }
  } = e;
  if (checked) {
    root.style.setProperty('--orange-light', 'rgb(255, 176, 0)');
    root.style.setProperty('--green-light', 'rgb(100, 143, 255)');
    root.style.setProperty('--red-light', 'rgb(220, 38, 127)');

    const get_color_blidness_zone =
      zone === 'VALLE'
        ? 'rgb(100, 143, 255)'
        : zone === 'llano'
        ? 'rgb(255, 176, 0)'
        : 'rgb(220, 38, 127)';
    main_element.style.backgroundColor = get_color_blidness_zone;
    menu_element.style.backgroundColor = get_color_blidness_zone;
  } else {
    root.style.setProperty('--orange-light', '#ffae3ab3');
    root.style.setProperty('--green-light', '#a2fcc1b3');
    root.style.setProperty('--red-light', '#ec1d2fb3');
    main_element.style.backgroundColor = get_zone_color(zone);
    menu_element.style.backgroundColor = get_zone_color(zone);
  }
});
