// Aviso flotante: avisa de que ya hay precio de la luz para mañana y de si es
// el provisional de OMIE (subasta, ~13:30) o el PVPC definitivo de ESIOS
// (~20:15). La fuente la decide el dato, no el reloj: se comprueba qué JSON
// contiene el día de mañana (misma regla que scripts/vite-plugin-daily-data.mjs).
//
// Se importa desde todas las entradas JS del sitio y se ejecuta tras `idle`
// para no competir con el LCP. Cerrado, no vuelve a salir para el mismo día y
// fuente (localStorage); al pasar de OMIE a ESIOS vuelve a aparecer una vez.

const DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado'
];
const MONTH_NAMES = [
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

const madridDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function madridTomorrow(now = new Date()) {
  const parts = Object.fromEntries(
    madridDateFormat.formatToParts(now).map(({ type, value }) => [type, value])
  );
  const date = new Date(
    Date.UTC(+parts.year, +parts.month - 1, +parts.day + 1)
  );
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: date.getUTCDay()
  };
}

function longDate({ day, month, weekday }) {
  return `${DAY_NAMES[weekday]} ${day} de ${MONTH_NAMES[month - 1]}`;
}

function storageKey({ year, month, day }, source) {
  return `tomorrow-notice-${year}-${month}-${day}-${source}`;
}

function readDismissed(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(key) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Sin almacenamiento: el aviso se repite en la siguiente visita.
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ESIOS: [{ day: "20/09/2026", hour, price, zone }]
function esiosHasTomorrow(rows, tomorrow) {
  if (!Array.isArray(rows) || !rows.length || typeof rows[0].day !== 'string')
    return false;
  const [day, month, year] = rows[0].day.split('/').map(Number);
  return (
    day === tomorrow.day && month === tomorrow.month && year === tomorrow.year
  );
}

// OMIE: [{ year, month, day, hour, price, pricemin }]
function omieHasTomorrow(rows, tomorrow) {
  if (!Array.isArray(rows) || !rows.length) return false;
  const { year, month, day } = rows[0];
  return (
    +day === tomorrow.day &&
    +month === tomorrow.month &&
    +year === tomorrow.year
  );
}

export async function resolveTomorrowSource(tomorrow, load = fetchJson) {
  const esios = await load('/data/tomorrow_price.json');
  if (esiosHasTomorrow(esios, tomorrow)) return 'ESIOS';
  const omie = await load('/data/omie_data.json');
  if (omieHasTomorrow(omie, tomorrow)) return 'OMIE';
  return null;
}

function render(tomorrow, source, key) {
  const onTomorrowPage = location.pathname.startsWith('/precio-luz-manana');
  const date = longDate(tomorrow);
  const text =
    source === 'ESIOS'
      ? `Ya está el precio de la luz de mañana, ${date}: PVPC definitivo.`
      : `Ya hay precio provisional de la luz para mañana, ${date}. El definitivo, hora a hora, a las 20:15.`;

  const aside = document.createElement('aside');
  aside.className = `tomorrow-notice tomorrow-notice-${source.toLowerCase()}`;
  aside.setAttribute('role', 'status');

  const message = document.createElement('p');
  message.className = 'tomorrow-notice-text';
  message.textContent = text;
  if (!onTomorrowPage) {
    message.append(' ');
    const link = document.createElement('a');
    link.href = '/precio-luz-manana/';
    link.className = 'tomorrow-notice-link';
    link.textContent = 'Ver el precio de mañana';
    message.append(link);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'tomorrow-notice-close';
  close.setAttribute('aria-label', 'Cerrar aviso');
  close.textContent = '×';
  close.addEventListener('click', () => {
    writeDismissed(key);
    aside.remove();
  });

  aside.append(message, close);
  document.body.append(aside);
}

export async function showTomorrowNotice() {
  const tomorrow = madridTomorrow();
  const source = await resolveTomorrowSource(tomorrow);
  if (!source) return;
  const key = storageKey(tomorrow, source);
  if (readDismissed(key)) return;
  if (document.querySelector('.tomorrow-notice')) return;
  render(tomorrow, source, key);
}

function whenIdle(task) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, { timeout: 4000 });
  } else {
    setTimeout(task, 2000);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const start = () => whenIdle(() => showTomorrowNotice());
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
}
