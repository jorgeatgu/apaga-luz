import './../css/styles.css';
import data from '../../price-postprocessed.json';

console.log(data);
const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;

const userHour = new Date().getHours();
console.log('userHour', userHour);

const getHour = data.filter(({ firstHour }) =>
  console.log(new Date(firstHour).getHours() - 1)
);
console.log('getHour', getHour);
