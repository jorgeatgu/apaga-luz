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

export function reload_page(minutes) {
  const reload_page_minutes = 60 - minutes;
  const milliseconds = (h, m, s) => (h * 60 * 60 + m * 60 + s) * 1000;
  const result = milliseconds(0, reload_page_minutes, 0);

  setTimeout(() => {
    location.reload();
  }, result);
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

export const get_zone_color = zone =>
  zone === 'valle' ? '#a2fcc1' : zone === 'llano' ? '#ffae3a' : '#ec1d2f';

export const month_names = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

export const day_names = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo'
];

export const day_names_us = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado'
];

export const width_mobile =
  window.innerWidth > 0 ? window.innerWidth : screen.width;

export const last_n_days = n_days =>
  [...Array(n_days)]
    .map((_, index) => {
      const dates = new Date();
      dates.setDate(dates.getDate() - index);
      return dates;
    })
    .map(d => {
      const get_string_day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
      const get_string_month =
        d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
      return `${get_string_day}/${get_string_month}/${d.getFullYear()}`;
    });
