import './../css/styles.css';
import data from '../../public/price-postprocessed.json';
import dataNextDay from '../../public/price-postprocessed-next-day.json';
import dataCanary from '../../public/price-postprocessed-canary.json';
import {
  nextCheapHour,
  reloadPage,
  tablePrice,
  tablePriceNextDay,
  getZoneColor,
  isNationalDay,
  removeTables,
  removeTablesNextDay
} from './utils.js';

const getTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

let userHour = new Date().getHours();
let userMinutes = new Date().getMinutes();
let userDay = new Date().getDay();

const isUserCanary =
  getTimeZone === 'Atlantic/Canary' && userHour > 22 && userHour < 24;
let dataPrices = isUserCanary ? dataCanary : data;

const [{ price }] = dataPrices.filter(({ hour }) => +hour == userHour);

userHour = userHour < 10 ? `0${userHour}` : userHour;
userMinutes = userMinutes < 10 ? `0${userMinutes}` : userMinutes;

const priceElement = document.getElementById('price');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const calendar = document.getElementById('calendar');

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

document.getElementById('order-price').addEventListener('click', e => {
  removeTables();
  orderByPrice();
});

document.getElementById('order-hour').addEventListener('click', e => {
  removeTables();
  orderByHour();
});

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

let filterDataNextDay = dataNextDay.sort(({ price: a }, { price: b }) => a - b);
const containerTableNextDay = document.querySelector('.table-next-day');
filterDataNextDay = filterDataNextDay.map(({ price, ...rest }) => {
  return {
    price: price.toFixed(3),
    ...rest
  };
});

for (let [index, element] of filterDataNextDay.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

const halfPastEight = 19 * 60 + 40;
if (userHour * 60 >= halfPastEight && userHour < 24) {
  containerTableNextDay.style.display = 'grid';
  orderTableNextDayByHour();

  document
    .querySelector('.container-table-next-day-title')
    .addEventListener('click', e => {
      const { target } = e;
      const gridTableNextDay = document.querySelector(
        '.container-table-next-day-grid'
      );
      gridTableNextDay.classList.toggle('show');
      target.classList.toggle('rotate');
    });
} else {
  containerTableNextDay.style.display = 'none';
}

function orderTableNextDayByPrice() {
  filterDataNextDay = filterDataNextDay.sort(
    ({ price: a }, { price: b }) => a - b
  );

  tablePriceNextDay(
    filterDataNextDay.slice(0, 12),
    '.table-next-day-grid-left'
  );
  tablePriceNextDay(
    filterDataNextDay.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

function orderTableNextDayByHour() {
  filterDataNextDay = filterDataNextDay.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  tablePriceNextDay(
    filterDataNextDay.slice(0, 12),
    '.table-next-day-grid-left'
  );
  tablePriceNextDay(
    filterDataNextDay.slice(12, 24),
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

let root = document.documentElement;

document.getElementById('color-blindness').addEventListener('change', e => {
  const {
    target: { checked }
  } = e;
  if (checked) {
    root.style.setProperty('--orange-light', 'rgb(255, 176, 0)');
    root.style.setProperty('--green-light', 'rgb(100, 143, 255)');
    root.style.setProperty('--red-light', 'rgb(220, 38, 127)');

    const getColorBlidnessZone =
      zone === 'valle'
        ? 'rgb(100, 143, 255)'
        : zone === 'llano'
        ? 'rgb(255, 176, 0)'
        : 'rgb(220, 38, 127)';
    mainElement.style.backgroundColor = getColorBlidnessZone;
    menuElement.style.backgroundColor = getColorBlidnessZone;
  } else {
    root.style.setProperty('--orange-light', '#ffae3ab3');
    root.style.setProperty('--green-light', '#a2fcc1b3');
    root.style.setProperty('--red-light', '#ec1d2fb3');
    mainElement.style.backgroundColor = getZoneColor(zone);
    menuElement.style.backgroundColor = getZoneColor(zone);
  }
});
