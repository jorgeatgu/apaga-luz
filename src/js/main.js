import './../css/styles.css';
import data from '../../public/price-postprocessed.json';

let userHour = new Date().getHours();
let userMinutes = new Date().getMinutes();
const [{ price, zone }] = data.filter(({ hour }) => +hour === userHour);

userHour = userHour < 10 ? `0${userHour}` : userHour;
userMinutes = userMinutes < 10 ? `0${userMinutes}` : userMinutes;

const priceElement = document.getElementById('price');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');

const expensiveHour = data.reduce((p, c) => (p.price > c.price ? p : c));
const cheapHour = data.reduce((p, c) => (p.price < c.price ? p : c));

const cheapHourElement = document.getElementById('cheaphour');
const cheapPriceElement = document.getElementById('price-cheap-hour');

cheapHourElement.textContent = cheapHour.hour;
cheapPriceElement.textContent = cheapHour.price;

const expensiveHourElement = document.getElementById('expensivehour');
const expensivePriceElement = document.getElementById('price-expensive-hour');

expensiveHourElement.textContent = expensiveHour.hour;
expensivePriceElement.textContent = expensiveHour.price;

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

const mainElement = document.getElementsByTagName('main')[0];
mainElement.style.backgroundColor = getZone(zone);
