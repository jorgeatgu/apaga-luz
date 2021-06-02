import './../css/styles.css';
import data from '../../price-postprocessed.json';

const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userHour = new Date().getHours();
const [{ price }] = data.filter(({ hour }) => +hour === userHour);

const getPriceElement = document.getElementById('price');

getPriceElement.textContent = `${price}€`;
