import data from '../../public/price-postprocessed.json';

export function nextCheapHour() {
  const userHour = new Date().getHours();
  const userMinutes = new Date().getMinutes();

  const filteredData = data.filter(({ hour }) => +hour > userHour);
  const cheapHour = filteredData.reduce((p, c) => (p.price < c.price ? p : c));
  const { hour } = cheapHour;
  let timerHour = hour - (userHour + 1);
  const timerMinutes = Math.abs(60 - userMinutes);
  let textHour = timerHour > 1 ? 'horas y' : 'hora y';
  textHour = textHour !== 0 ? textHour : '';
  timeHour = timeHour !== 0 ? textHour : '';
  const textMinutes = timerMinutes > 1 ? 'minutos' : 'minuto';
  const text = `La próxima hora más barata es dentro de ${timerHour} ${textHour} ${timerMinutes} ${textMinutes}`;
}

export function reloadPage(minutes) {
  const reloadPage = 60 - minutes;
  const milliseconds = (h, m, s) => (h * 60 * 60 + m * 60 + s) * 1000;
  const result = milliseconds(0, reloadPage, 0);

  setTimeout(() => {
    location.reload();
  }, result);
}

const nationalDays = [
  new Date(2021, 9, 12).setHours(0, 0, 0, 0),
  new Date(2021, 10, 1).setHours(0, 0, 0, 0),
  new Date(2021, 11, 6).setHours(0, 0, 0, 0),
  new Date(2021, 11, 8).setHours(0, 0, 0, 0),
  new Date(2021, 11, 25).setHours(0, 0, 0, 0)
];

const userDate = new Date().setHours(0, 0, 0, 0);
export const isNationalDay = nationalDays.some(
  d => d.valueOf() === userDate.valueOf()
);

export function tablePrice(dataHours, element) {
  const container = document.querySelector(element);
  const getValueCheckboxHours = document.getElementById('checkbox-hours')
    .checked;

  let userDay = new Date().getDay();

  for (let elements of dataHours) {
    const { price, hour, zone, hourHasPassed } = elements;
    const transformHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const userDay = new Date().getDay();
    /*let zoneClass = userDay > 0 && userDay <= 5 ? zone : 'valle';
    zoneClass = isNationalDay ? 'valle' : zoneClass;*/
    const hourHasPassedClass =
      hourHasPassed && getValueCheckboxHours ? 'element-hour-disabled' : '';

    const blockHour = `<div class="${hourHasPassedClass} container-table-price-element">
      <span class="container-table-price-element-hour ${zone}">
        ${transformHour}
      </span>
      <span class="container-table-price-element-price">
        ${price} €/kWh
      </span>
    </div>`;
    container.insertAdjacentHTML('beforeend', blockHour);
  }
}

export function createZone(hour) {
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

export const getZoneColor = zone =>
  zone === 'valle' ? '#a2fcc1' : zone === 'llano' ? '#ffae3a' : '#ec1d2f';

export function tablePriceNextDay(dataHours, element) {
  const container = document.querySelector('.table-next-day');
  const tableGrid = document.querySelector(element);
  let title;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (!document.querySelector('.container-table-next-day-title')) {
    title = `<h3 class="container-table-next-day-title">Precios para mañana: ${tomorrow.toLocaleDateString(
      'es-ES',
      options
    )}</h3>`;
    container.insertAdjacentHTML('afterbegin', title);
  }

  for (let element of dataHours) {
    const { price, hour, zone } = element;
    const transformHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    let zoneClass =
      tomorrow.getDay() > 0 && tomorrow.getDay() <= 5 ? zone : 'valle';

    const blockHour = `<div class="container-table-price-element">
      <span class="container-table-price-element-hour ${zoneClass}">
        ${transformHour}
      </span>
      <span class="container-table-price-element-price">
        ${price} €/kWh
      </span>
    </div>`;

    tableGrid.insertAdjacentHTML('beforeend', blockHour);
  }
}

export function removeTable(element) {
  const containerTable = document.querySelector(element);
  while (containerTable.firstChild) {
    containerTable.removeChild(containerTable.firstChild);
  }
}

export function removeTables() {
  const containerTableLeft = document.querySelector(
    '.container-table-price-left'
  );
  const containerTableRight = document.querySelector(
    '.container-table-price-right'
  );
  while (containerTableLeft.firstChild) {
    containerTableLeft.removeChild(containerTableLeft.firstChild);
  }

  while (containerTableRight.firstChild) {
    containerTableRight.removeChild(containerTableRight.firstChild);
  }
}

export function removeTablesNextDay() {
  const containerTableLeft = document.querySelector(
    '.table-next-day-grid-left'
  );
  const containerTableRight = document.querySelector(
    '.table-next-day-grid-right'
  );
  while (containerTableLeft.firstChild) {
    containerTableLeft.removeChild(containerTableLeft.firstChild);
  }

  while (containerTableRight.firstChild) {
    containerTableRight.removeChild(containerTableRight.firstChild);
  }
}
