import './../styles/styles.css';
import data_all_days from '../../public/data/all_prices.json';
import data_today from '../../public/data/today_price.json';
import data_tomorrow from '../../public/data/tomorrow_price.json';
import data_canary from '../../public/data/canary_price.json';
import {
  reloadPage,
  tablePrice,
  tablePriceNextDay,
  getZoneColor,
  removeTables,
  removeTablesNextDay
} from './utils.js';
import { createNewTable } from './table.js';

const month_names = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const getTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

let userHour = new Date().getHours();
let userMinutes = new Date().getMinutes();
let userDay = new Date();

const isUserCanary =
  getTimeZone === 'Atlantic/Canary' && userHour > 22 && userHour < 24;
let dataPrices = isUserCanary ? data_canary : data_today;

const [{ price }] = dataPrices.filter(({ hour }) => +hour == userHour);

userHour = userHour < 10 ? `0${userHour}` : userHour;
userMinutes = userMinutes < 10 ? `0${userMinutes}` : userMinutes;

const priceElement = document.getElementById('price');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');

priceElement.textContent = `${price.toFixed(3)}`;
hoursElement.textContent = userHour;
minutesElement.textContent = userMinutes;

const mainElement = document.getElementsByTagName('main')[0];
const menuElement = document.getElementsByTagName('nav')[0];

reloadPage(userMinutes);

const filterDataByUserHour = dataPrices.map(({ hour, price, ...rest }) => {
  return {
    hourHasPassed: +hour < userHour ? true : false,
    price: price.toFixed(3),
    hour,
    ...rest
  };
});

let filterDataToday = filterDataByUserHour.sort(
  ({ price: a }, { price: b }) => a - b
);
/*This code is temporary. Hours are reordered based on prices, not Government nomenclature.*/
for (let [index, element] of filterDataToday.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

const [{ zone }] = filterDataToday.filter(({ hour }) => hour == userHour);
mainElement.style.backgroundColor = getZoneColor(zone);
menuElement.style.backgroundColor = getZoneColor(zone);

let typeOfOrder;

function orderByPrice() {
  filterDataToday = filterDataToday.sort(({ price: a }, { price: b }) => a - b);
  tablePrice(filterDataToday.slice(0, 12), '.container-table-price-left');
  tablePrice(filterDataToday.slice(12, 24), '.container-table-price-right');

  typeOfOrder = 'price';
}

function orderByHour() {
  filterDataToday = filterDataToday.sort(({ hour: a }, { hour: b }) => a - b);
  tablePrice(filterDataToday.slice(0, 12), '.container-table-price-left');
  tablePrice(filterDataToday.slice(12, 24), '.container-table-price-right');
  typeOfOrder = 'hour';
}

orderByHour();

document.getElementById('order-price').addEventListener('click', () => {
  removeTables();
  orderByPrice();
});

document.getElementById('order-hour').addEventListener('click', () => {
  removeTables();
  orderByHour();
});

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

let filter_data_tomorrow = data_tomorrow.sort(
  ({ price: a }, { price: b }) => a - b
);
const containerTableNextDay = document.querySelector('.table-next-day');
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

const halfPastEightMinutes = 1230;
if (userHour * 60 + +userMinutes >= halfPastEightMinutes && userHour < 24) {
  containerTableNextDay.style.display = 'grid';
  orderTableNextDayByHour();
} else {
  containerTableNextDay.style.display = 'none';
}

function orderTableNextDayByPrice() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ price: a }, { price: b }) => a - b
  );

  tablePriceNextDay(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  tablePriceNextDay(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

function orderTableNextDayByHour() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  tablePriceNextDay(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  tablePriceNextDay(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

document.getElementById('order-price-next').addEventListener('click', () => {
  removeTablesNextDay();
  orderTableNextDayByPrice();
});

document.getElementById('order-hour-next').addEventListener('click', () => {
  removeTablesNextDay();
  orderTableNextDayByHour();
});

document.getElementById('checkbox-hours').addEventListener('change', () => {
  if (typeOfOrder === 'price') {
    removeTables();
    orderByPrice();
  } else {
    removeTables();
    orderByHour();
  }
});

const text_whatsApp = `whatsapp://send?text=El precio de la luz a las ${userHour}:${userMinutes} es de ${price.toFixed(
  3
)} €/kWh https://www.apaga-luz.com/?utm_source=whatsapp`;
const button_whatsApp = document.getElementById('btn-whatsapp');
button_whatsApp.href = text_whatsApp;

const get_string_day =
  userDay.getDate() < 10 ? `0${userDay.getDate()}` : userDay.getDate();
const get_string_month =
  userDay.getMonth() < 10
    ? `0${userDay.getMonth() + 1}`
    : userDay.getMonth() + 1;

const filtered_data_table_by_day = data_all_days.filter(({ dia }) =>
  dia.includes(`${get_string_day}/${get_string_month}`)
);

const last_n_days = nDays =>
  [...Array(nDays)].map((_, index) => {
    const dates = new Date();
    dates.setDate(dates.getDate() - 6 + index);
    return dates;
  });

let last_week_strings = last_n_days(7);
last_week_strings = last_week_strings.map(d => {
  const get_string_day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const get_string_month =
    d.getMonth() < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
  return `${get_string_day}/${get_string_month}/${d.getFullYear()}`;
});

const filtered_data_table_by_last_week = data_all_days.filter(day =>
  last_week_strings.includes(day.dia)
);

createNewTable(filtered_data_table_by_day, 'table-year', 'year');
createNewTable(filtered_data_table_by_last_week, 'table-week', 'day');

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
      zone === 'valle'
        ? 'rgb(100, 143, 255)'
        : zone === 'llano'
        ? 'rgb(255, 176, 0)'
        : 'rgb(220, 38, 127)';
    mainElement.style.backgroundColor = get_color_blidness_zone;
    menuElement.style.backgroundColor = get_color_blidness_zone;
  } else {
    root.style.setProperty('--orange-light', '#ffae3ab3');
    root.style.setProperty('--green-light', '#a2fcc1b3');
    root.style.setProperty('--red-light', '#ec1d2fb3');
    mainElement.style.backgroundColor = getZoneColor(zone);
    menuElement.style.backgroundColor = getZoneColor(zone);
  }
});

const get_table_historic_date = document.getElementById('js-table-date');
get_table_historic_date.textContent = ` el ${userDay.getDate()} de ${
  month_names[userDay.getMonth()]
}`;
