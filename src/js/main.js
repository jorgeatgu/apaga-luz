import './../css/styles.css';
import data from '../../price-postprocessed.json';

console.log(data);

const firstDate = new Date();
const secondDate = new Date();
console.log('firstDate', firstDate);
secondDate.setHours(secondDate.getHours() + 1);
console.log('secondDate', secondDate);
const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;
