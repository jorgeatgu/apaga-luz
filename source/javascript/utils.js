// Removed static import - data is now loaded dynamically in main.js

export function reload_page(minutes) {
  const reload_page_minutes = 60 - minutes;
  const milliseconds = (h, m, s) => (h * 60 * 60 + m * 60 + s) * 1000;
  const result = milliseconds(0, reload_page_minutes, 0);

  // Usar timeout optimizado que no interfiera con INP
  const timeoutId = setTimeout(() => {
    // Recargar solo si la página está visible para evitar interferencias
    if (!document.hidden) {
      location.reload();
    } else {
      // Si no está visible, esperar a que lo esté
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          location.reload();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange, {
        once: true
      });
    }
  }, result);

  // Limpiar timeout si la página se descarga
  window.addEventListener(
    'beforeunload',
    () => {
      clearTimeout(timeoutId);
    },
    { once: true }
  );
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

export const get_price_color = priceColor =>
  priceColor === 'price-green'
    ? '#a2fcc1'
    : priceColor === 'price-yellow'
    ? '#ffae3a'
    : '#ec1d2f';

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

export const is_week_end = date =>
  date.getDay() === 0 || date.getDay() === 7 ? true : false;
