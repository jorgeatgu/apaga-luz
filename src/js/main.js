import './../css/styles.css';
import data from '../../public/price-postprocessed.json';
import { week, weekEnd } from './templates.js';
import {
  nextCheapHour,
  reloadPage,
  tablePrice,
  tablePriceNextDay,
  getZoneColor
} from './utils.js';

let userHour = new Date().getHours();
let userMinutes = new Date().getMinutes();
let userDay = new Date().getDay();

const [{ price, zone }] = data.filter(({ hour }) => +hour === userHour);

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

if (userDay > 0 && userDay <= 5) {
  calendar.innerHTML = week;
  mainElement.style.backgroundColor = getZoneColor(zone);
} else {
  calendar.innerHTML = weekEnd;
  calendar.style.gridTemplateColumns = '1fr';
  mainElement.style.backgroundColor = '#a2fcc1';
}

reloadPage(userMinutes);

const filterDataByUserHour = data.map(({ hour, price, ...rest }) => {
  return {
    hourHasPassed: +hour < userHour ? true : false,
    price: price.toFixed(3),
    hour,
    ...rest
  };
});

let expensiveHours = filterDataByUserHour.sort((a, b) => b.price - a.price);
let reverseCheapHours = [...expensiveHours].reverse();

expensiveHours = expensiveHours
  .slice(0, 12)
  .sort((a, b) => +a.hourHasPassed - +b.hourHasPassed || b.price - a.price);
reverseCheapHours = reverseCheapHours
  .slice(0, 12)
  .sort((a, b) => +a.hourHasPassed - +b.hourHasPassed || a.price - b.price);

tablePrice(reverseCheapHours, 'cheap-element');
tablePrice(expensiveHours, 'expensive-element');

/*
Prices are published at 20:30,
at 21:00 I publish the next day's data,
this table will only be available until 24:00.
*/

/*const containerTableNextDay = document.querySelector('.table-next-day');
if (userHour >= 21 && userHour < 24) {
  containerTableNextDay.style.display = 'grid';
  const filterDataNextDay = dataNextDay.map(({ price, ...rest }) => {
    return {
      price: price.toFixed(3),
      ...rest
    };
  });

  tablePriceNextDay(filterDataNextDay);
} else {
  containerTableNextDay.style.display = 'none';
}*/
