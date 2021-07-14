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

export function tablePrice(dataHours, element) {
  const container = document.getElementById(element);

  let userDay = new Date().getDay();

  const title =
    element === 'cheap-element'
      ? `<h3 class="container-table-price-element-title">Las horas más baratas</h3>`
      : `<h3 class="container-table-price-element-title">Las horas más caras</h3>`;

  container.insertAdjacentHTML('beforeend', title);

  for (let element of dataHours) {
    const { price, hour, zone, hourHasPassed } = element;
    const transformHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const userDay = new Date().getDay();
    const zoneClass = userDay > 0 && userDay <= 5 ? zone : 'valle';
    const hourHasPassedClass = hourHasPassed ? 'element-hour-disabled' : '';

    const blockHour = `<div class="${hourHasPassedClass} container-table-price-element">
      <span class="container-table-price-element-hour ${zoneClass}">
        ${transformHour}
      </span>
      <span class="container-table-price-element-price">
        ${price} €/kWh
      </span>
    </div>`;

    container.insertAdjacentHTML('beforeend', blockHour);
  }
}
