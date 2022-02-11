import data from '../../public/data/today_price.json';

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

export function tablePrice(data_hours, element) {
  const container = document.querySelector(element);
  const get_value_checkbox_hours =
    document.getElementById('checkbox-hours').checked;

  let user_day = new Date().getDay();

  for (let elements of data_hours) {
    const { price, hour, zone, hourHasPassed } = elements;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const user_day = new Date().getDay();
    const hour_has_passed_class =
      hourHasPassed && get_value_checkbox_hours ? 'element-hour-disabled' : '';

    const block_hour = `<div class="${hour_has_passed_class} container-table-price-element">
      <span class="container-table-price-element-hour ${zone}">
        ${transform_hour}
      </span>
      <span class="container-table-price-element-price">
        ${price} €/kWh
      </span>
    </div>`;
    container.insertAdjacentHTML('beforeend', block_hour);
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

export function tablePriceNextDay(data_hours, element) {
  const container = document.querySelector('.table-next-day');
  const table_grid = document.querySelector(element);
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

  for (let element of data_hours) {
    const { price, hour, zone } = element;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;

    const block_hour = `<div class="container-table-price-element">
      <span class="container-table-price-element-hour ${zone}">
        ${transform_hour}
      </span>
      <span class="container-table-price-element-price">
        ${price} €/kWh
      </span>
    </div>`;

    table_grid.insertAdjacentHTML('beforeend', block_hour);
  }
}

export function removeTable(element) {
  const container_table_ = document.querySelector(element);
  while (container_table_.firstChild) {
    container_table_.removeChild(container_table_.firstChild);
  }
}

export function removeTables() {
  const container_table_left = document.querySelector(
    '.container-table-price-left'
  );
  const container_table_right = document.querySelector(
    '.container-table-price-right'
  );
  while (container_table_left.firstChild) {
    container_table_left.removeChild(container_table_left.firstChild);
  }

  while (container_table_right.firstChild) {
    container_table_right.removeChild(container_table_right.firstChild);
  }
}

export function removeTablesNextDay() {
  const container_table_left = document.querySelector(
    '.table-next-day-grid-left'
  );
  const container_table_right = document.querySelector(
    '.table-next-day-grid-right'
  );
  while (container_table_left.firstChild) {
    container_table_left.removeChild(container_table_left.firstChild);
  }

  while (container_table_right.firstChild) {
    container_table_right.removeChild(container_table_right.firstChild);
  }
}
