import './../css/styles.css';
/*import data from '../../price-postprocessed.json';*/
import dataPrice from '../../price.json';

/*const timeZoneUser = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userHour = new Date().getHours();
const [{ price, zone }] = data.filter(({ hour }) => +hour === userHour);

const getPriceElement = document.getElementById('price');

function backgroundZone(zone) {}

getPriceElement.textContent = `${price}€`;*/

const filteredData = dataPrice.PVPC.map(({ Dia, Hora, PCB }) => {
  const getFirstHour = Hora.split('-')[0];
  return {
    day: Dia,
    hour: getFirstHour,
    price: +PCB.split(',')[0] / 1000,
    zone: getZone(+getFirstHour)
  };
});

function getZone(hour) {
  console.log('hour', hour);
  if (hour >= 0 && hour < 8) {
    return 'valle';
  } else if (
    (hour >= 8 && hour < 10) ||
    (hour >= 14 && hour < 18) ||
    (hour >= 22 && hour < 24)
  ) {
    return 'llano';
  } else {
    return 'punta';
  }
}

console.log('filteredData', filteredData);
