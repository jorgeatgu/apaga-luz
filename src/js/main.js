import './../css/styles.css';
import data from '../../public/price-postprocessed.json';
import { week, weekEnd } from './templates.js';
import { nextCheapHour, reloadPage } from './utils.js';

let userHour = new Date().getHours();
let userMinutes = new Date().getMinutes();
let userDay = new Date().getDay();

const [{ price, zone }] = data.filter(({ hour }) => +hour === userHour);
const filterDataByUserHour = data.filter(({ hour }) => +hour > userHour);

userHour = userHour < 10 ? `0${userHour}` : userHour;
userMinutes = userMinutes < 10 ? `0${userMinutes}` : userMinutes;

const priceElement = document.getElementById('price');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const calendar = document.getElementById('calendar');

const filterData =
  userHour < 23
    ? filterDataByUserHour
    : data.filter(({ hour }) => +hour === userHour);
const expensiveHour = filterData.reduce((p, c) => (p.price > c.price ? p : c));
const cheapHour = filterData.reduce((p, c) => (p.price < c.price ? p : c));

const cheapElement = document.getElementById('cheap-element');
const cheapText =
  cheapHour && userHour < 23
    ? (cheapElement.innerHTML = `<div class="cheap-element-container"><span class="cheap-element-text">La próxima hora más barata</span><span class="cheap-element-hour">${cheapHour.hour}:00</span><span class="cheap-element-price">${cheapHour.price}<b class="symbols"> €/kWh</b></span></div>`)
    : '';

const expensiveElement = document.getElementById('expensive-element');
const expensiveText =
  expensiveHour && expensiveHour.hour !== cheapHour.hour
    ? (expensiveElement.innerHTML = `<div class="expensive-element-container"><span class="cheap-element-text">La próxima hora más cara</span><span class="cheap-element-hour">${expensiveHour.hour}:00</span><span class="cheap-element-price">${expensiveHour.price}<b class="symbols"> €/kWh</b></span></div>`)
    : '';

priceElement.textContent = `${price}`;
hoursElement.textContent = userHour;
minutesElement.textContent = userMinutes;

const getZone = zone =>
  zone === 'valle' ? '#a2fcc1' : zone === 'llano' ? '#ffae3a' : '#ec1d2f';

const mainElement = document.getElementsByTagName('main')[0];

if (userDay > 0 && userDay <= 5) {
  calendar.innerHTML = week;
  mainElement.style.backgroundColor = getZone(zone);
} else {
  calendar.innerHTML = weekEnd;
  calendar.style.gridTemplateColumns = '1fr';
  mainElement.style.backgroundColor = '#a2fcc1';
}

reloadPage(userMinutes);
