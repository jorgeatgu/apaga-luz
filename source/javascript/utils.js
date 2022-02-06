import data from '../../public/data/price-today.json';

export function nextCheapHour() {
  const user_hour = new Date().getHours();
  const user_minutes = new Date().getMinutes();

  const filtered_data = data.filter(({ hour }) => +hour > user_hour);
  const cheap_hour = filtered_data.reduce((p, c) =>
    p.price < c.price ? p : c
  );
  const { hour } = cheap_hour;
  let timer_hour = hour - (user_hour + 1);
  const timer_minutes = Math.abs(60 - user_minutes);
  let text_hour = timer_hour > 1 ? 'horas y' : 'hora y';
  text_hour = text_hour !== 0 ? text_hour : '';
  timer_hour = timer_hour !== 0 ? text_hour : '';
  const text_minutes = timer_minutes > 1 ? 'minutos' : 'minuto';
  const text = `La próxima hora más barata es dentro de ${timer_hour} ${text_hour} ${timer_minutes} ${text_minutes}`;
}

export function reloadPage(minutes) {
  const reload_page_minutes = 60 - minutes;
  const milliseconds = (h, m, s) => (h * 60 * 60 + m * 60 + s) * 1000;
  const result = milliseconds(0, reload_page_minutes, 0);

  setTimeout(() => {
    location.reload();
  }, result);
}

export function tablePrice(dataHours, element) {
  const container = document.querySelector(element);
  const getValueCheckboxHours =
    document.getElementById('checkbox-hours').checked;

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
    month: 'long',
    day: 'numeric'
  };

  if (!document.querySelector('.container-table-next-day-title')) {
    title = `<summary><h3 class="container-table-next-day-title"><span style="font-weight: normal; pointer-events:none;">Precios para mañana</span>: ${tomorrow.toLocaleDateString(
      'es-ES',
      options
    )}</h3></summary>`;
    container.insertAdjacentHTML('afterbegin', title);
  }

  for (let element of dataHours) {
    const { price, hour, zone } = element;
    const transformHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;

    const blockHour = `<div class="container-table-price-element">
      <span class="container-table-price-element-hour ${zone}">
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

export function colorBlindness() {
  let root = document.documentElement;

  document.getElementById('color-blindness').addEventListener('change', e => {
    const {
      target: { checked }
    } = e;
    if (checked) {
      root.style.setProperty('--orange-light', 'rgb(255, 176, 0)');
      root.style.setProperty('--green-light', 'rgb(100, 143, 255)');
      root.style.setProperty('--red-light', 'rgb(220, 38, 127)');

      const getColorBlidnessZone =
        zone === 'valle'
          ? 'rgb(100, 143, 255)'
          : zone === 'llano'
          ? 'rgb(255, 176, 0)'
          : 'rgb(220, 38, 127)';
      mainElement.style.backgroundColor = getColorBlidnessZone;
      menuElement.style.backgroundColor = getColorBlidnessZone;
    } else {
      root.style.setProperty('--orange-light', '#ffae3ab3');
      root.style.setProperty('--green-light', '#a2fcc1b3');
      root.style.setProperty('--red-light', '#ec1d2fb3');
      mainElement.style.backgroundColor = getZoneColor(zone);
      menuElement.style.backgroundColor = getZoneColor(zone);
    }
  });
}
