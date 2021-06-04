import './../css/styles.css';
import data from '../../public/price-postprocessed.json';
import { week, weekEnd } from './templates.js';
import { nextCheapHour } from './utils.js';

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

const expensiveHour = data.reduce((p, c) => (p.price > c.price ? p : c));
const cheapHour = data.reduce((p, c) => (p.price < c.price ? p : c));

const cheapElement = document.getElementById('cheap-element');
const cheapText = (cheapElement.innerHTML = `<span>La hora más barata es a las <b>${cheapHour.hour}</b><b>:00</b> - <b>${cheapHour.price}</b> <b>€/kWh</b></span>`);

const expensiveElement = document.getElementById('expensive-element');
const expensiveText = (expensiveElement.innerHTML = `<span>La hora más barata es a las <b>${expensiveHour.hour}</b><b>:00</b> - <b>${expensiveHour.price}</b> <b>€/kWh</b></span>`);

priceElement.textContent = `${price}`;
hoursElement.textContent = userHour;
minutesElement.textContent = userMinutes;

function getZone(zone) {
  let bgColor;
  if (zone === 'valle') {
    bgColor = '#a2fcc1';
  } else if (zone === 'llano') {
    bgColor = '#ffae3a';
  } else {
    bgColor = '#ec1d2f';
  }
  return bgColor;
}

if (userDay <= 5) {
  calendar.innerHTML = week;
} else {
  calendar.innerHTML = weekEnd;
  calendar.style.gridTemplateColumns = '1fr';
}

const mainElement = document.getElementsByTagName('main')[0];
mainElement.style.backgroundColor = getZone(zone);

const reloadPage = 60 - userMinutes;
const milliseconds = (h, m, s) => (h * 60 * 60 + m * 60 + s) * 1000;
const result = milliseconds(0, reloadPage, 0);

setTimeout(() => {
  location.reload();
}, result);
