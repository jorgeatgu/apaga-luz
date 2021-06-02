import './../css/styles.css';
import data from '../../price-postprocessed.json';

console.log(data);
const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;

const userHour = new Date().getHours();
console.log('userHour', userHour);

const getHour = data.filter(({ hour }) => hour === userHour);
console.log('getHour', getHour);
