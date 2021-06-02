import './../css/styles.css';
import data from '../../price-postprocessed.json';

const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userHour = new Date().getHours();
const [{ price, zone }] = data.filter(({ hour }) => +hour === userHour);

const getPriceElement = document.getElementById('price');

function backgroundZone(zone) {}

getPriceElement.textContent = `${price}€`;
