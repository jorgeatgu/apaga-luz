// Plugin de Vite: datos del día en el HTML estático.
//
// En `vite build` sustituye placeholders del HTML con la fecha y los precios
// de hoy y de mañana, leídos de public/data/today_price.json,
// tomorrow_price.json y omie_data.json. Las fechas se calculan en
// Europe/Madrid, nunca con la hora local del runner. No actúa en `vite dev`:
// allí se ve el texto de fallback.
//
// SINTAXIS (contrato para las páginas que lo usen)
//
//   Valor:  <!--dd:hoy.fechaLarga-->hoy<!--/dd-->
//           Se sustituye por el valor (escapado). Si el dato no existe se deja
//           el texto de fallback que envuelven los marcadores.
//   Bloque: <!--dd:if manana.estado=A-->...<!--/dd-->   (igualdad)
//           <!--dd:if hoy.hayDatos-->...<!--/dd-->      (valor verdadero)
//           Si se cumple se deja el contenido; si no, se elimina entero.
//           Los bloques admiten placeholders anidados.
//   Los marcadores siempre desaparecen del HTML generado. Si hay marcadores
//   desbalanceados o una directiva no válida, la página se deja sin tocar y se
//   avisa por consola. Nunca rompe el build.
//
// CLAVES (prefijo `hoy.` o `manana.`)
//
//   fechaLarga       "viernes 18 de septiembre" (sin año)
//   diaSemana        "viernes"
//   fechaIso         "2026-09-18" (útil para dateModified en JSON-LD)
//   hayDatos         true | false
//   fuente           "ESIOS" | "OMIE" | null
//   estado           solo manana: "A" | "B" | "C"
//   precioMedio      "0,178"  (€/kWh, 3 decimales, coma; sin unidad)
//   precioMasBarato  "0,020"
//   horaMasBarata    "de 14:00 a 15:00"  (la 23 es "de 23:00 a 24:00")
//   precioMasCaro    "0,325"
//   horaMasCara      "de 20:00 a 21:00"
//   Empates: gana la hora más temprana. Sin datos, los precios y horas no
//   existen y se muestra el fallback.
//   esLaborable      true | false: false en sábado, domingo y festivos
//                    nacionales de fecha fija (existe aunque no haya datos)
//   precioValle      precio medio de la franja valle de la 2.0TD (00-08 h en
//                    laborable; el día entero si no es laborable)
//   precioLlano      08-10, 14-18 y 22-24 h; solo en laborable
//   precioPunta      10-14 y 18-22 h; solo en laborable
//   Festivos móviles (Viernes Santo) y autonómicos no se detectan.
//
// ESTADOS DE MAÑANA (decide el dato, no la hora del build)
//
//   C  tomorrow_price.json contiene mañana: PVPC de ESIOS (tras las 20:15).
//   B  si no, omie_data.json contiene mañana: precio de OMIE (tras ~13:30),
//      cuartos de hora promediados a horas. En el copy: "precio de la luz",
//      nunca "mayorista", más "El precio hora a hora se publica a las 20:15".
//   A  ninguno: solo fechas; "se publica a las 13:30 y 20:15".
//   hoy.hayDatos es false si today_price.json no es del día de hoy (Flat
//   falló); las fechas siguen siendo las correctas.
//
// DÓNDE USARLOS
//
//   En el cuerpo funcionan también en `vite dev` como comentarios. Dentro de
//   <title>, de atributos (meta description, og:*) y de JSON-LD también se
//   resuelven en build, pero en `vite dev` se ven los marcadores literales.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado'
];
const MESES = [
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

// Fecha civil { year, month, day } de Madrid para un instante dado.
function madridDate(now) {
  const parts = Object.fromEntries(
    madridDateFormat.formatToParts(now).map(({ type, value }) => [type, value])
  );
  return { year: +parts.year, month: +parts.month, day: +parts.day };
}

// Suma días a una fecha civil con aritmética UTC (independiente del TZ del runner).
function addDays({ year, month, day }, days) {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

function sameDate(a, b) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

const pad = n => String(n).padStart(2, '0');

// Festivos nacionales de fecha fija que la 2.0TD trata como valle todo el día.
const FESTIVOS = [
  '01-01',
  '01-06',
  '05-01',
  '08-15',
  '10-12',
  '11-01',
  '12-06',
  '12-08',
  '12-25'
];

function describeDate(date) {
  const weekday = new Date(
    Date.UTC(date.year, date.month - 1, date.day)
  ).getUTCDay();
  const diaSemana = DIAS[weekday];
  return {
    diaSemana,
    esLaborable:
      weekday !== 0 &&
      weekday !== 6 &&
      !FESTIVOS.includes(`${pad(date.month)}-${pad(date.day)}`),
    fechaLarga: `${diaSemana} ${date.day} de ${MESES[date.month - 1]}`,
    fechaIso: `${date.year}-${pad(date.month)}-${pad(date.day)}`
  };
}

// Evita "-0,000" cuando un precio negativo muy pequeño redondea a cero.
const formatPrice = price =>
  price
    .toFixed(3)
    .replace(/^-(0\.0+)$/, '$1')
    .replace('.', ',');
const formatHour = hour => `de ${pad(hour)}:00 a ${pad(hour + 1)}:00`;

const isFiniteNumber = value =>
  typeof value === 'number' && Number.isFinite(value);

// ESIOS: [{ day: 'DD/MM/YYYY', hour, price }]. Devuelve filas válidas normalizadas.
function parseEsios(data, label, warn) {
  if (!Array.isArray(data)) {
    warn(`${label}: no es un array, se ignora`);
    return [];
  }
  const rows = [];
  for (const row of data) {
    const match =
      row && typeof row.day === 'string'
        ? row.day.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        : null;
    if (!match || !isFiniteNumber(row.hour) || !isFiniteNumber(row.price)) {
      continue;
    }
    rows.push({
      date: { year: +match[3], month: +match[2], day: +match[1] },
      hour: row.hour,
      price: row.price
    });
  }
  if (rows.length < data.length) {
    warn(`${label}: ${data.length - rows.length} filas inválidas descartadas`);
  }
  return rows;
}

// OMIE: [{ year, month, day, hour: periodo - 1, price }], en periodos horarios
// o cuartohorarios (96 por día). Devuelve filas válidas normalizadas.
function parseOmie(data, warn) {
  if (!Array.isArray(data)) {
    warn('omie_data: no es un array, se ignora');
    return [];
  }
  const rows = [];
  for (const row of data) {
    if (!row) continue;
    const year = Number(row.year);
    const month = Number(row.month);
    const day = Number(row.day);
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      !isFiniteNumber(row.hour) ||
      !isFiniteNumber(row.price)
    ) {
      continue;
    }
    rows.push({ date: { year, month, day }, hour: row.hour, price: row.price });
  }
  return rows;
}

// Último domingo del mes (cambios de hora en España: marzo y octubre).
function isLastSunday({ year, month, day }, targetMonth) {
  if (month !== targetMonth) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  const nextWeek = new Date(Date.UTC(year, month - 1, day + 7));
  return date.getUTCDay() === 0 && nextWeek.getUTCMonth() !== month - 1;
}

// Hora de reloj del periodo horario `index` de un día con `hours` horas. El
// último domingo de marzo (23 h) no existe la 02:00; el de octubre (25 h) la
// 02:00 se repite y ambas se promedian juntas.
function clockHour(index, hours, date) {
  if (hours === 23 && isLastSunday(date, 3) && index >= 2) return index + 1;
  if (hours === 25 && isLastSunday(date, 10) && index >= 3) return index - 1;
  return index;
}

// Precio por hora del día pedido. Si hay más de 25 periodos, son cuartos de
// hora y se promedian de cuatro en cuatro.
function hourlyPrices(rows, date) {
  const dayRows = rows.filter(row => sameDate(row.date, date));
  const periodsPerHour = dayRows.length > 25 ? 4 : 1;
  const hours = Math.ceil(dayRows.length / periodsPerHour);
  const byHour = new Map();
  for (const { hour: period, price } of dayRows) {
    const hour = clockHour(Math.floor(period / periodsPerHour), hours, date);
    const bucket = byHour.get(hour) || [];
    bucket.push(price);
    byHour.set(hour, bucket);
  }
  return [...byHour.entries()]
    .map(([hour, prices]) => ({
      hour,
      price: prices.reduce((sum, p) => sum + p, 0) / prices.length
    }))
    .sort((a, b) => a.hour - b.hour);
}

// Franja 2.0TD de una hora de reloj en día laborable.
function franja(hour) {
  if (hour < 8) return 'Valle';
  if ((hour >= 10 && hour < 14) || (hour >= 18 && hour < 22)) return 'Punta';
  return 'Llano';
}

// Precio medio de cada franja. Si no es laborable, todo el día es valle.
function franjaPrices(prices, esLaborable) {
  const groups = {};
  for (const { hour, price } of prices) {
    const key = esLaborable ? franja(hour) : 'Valle';
    (groups[key] = groups[key] || []).push(price);
  }
  return Object.fromEntries(
    Object.entries(groups).map(([key, values]) => [
      `precio${key}`,
      formatPrice(values.reduce((sum, p) => sum + p, 0) / values.length)
    ])
  );
}

function priceSummary(prices) {
  let cheapest = prices[0];
  let dearest = prices[0];
  for (const entry of prices) {
    if (entry.price < cheapest.price) cheapest = entry;
    if (entry.price > dearest.price) dearest = entry;
  }
  const mean =
    prices.reduce((sum, { price }) => sum + price, 0) / prices.length;
  return {
    precioMedio: formatPrice(mean),
    horaMasBarata: formatHour(cheapest.hour),
    precioMasBarato: formatPrice(cheapest.price),
    horaMasCara: formatHour(dearest.hour),
    precioMasCaro: formatPrice(dearest.price)
  };
}

export function computeDailyContext({
  today,
  tomorrow,
  omie,
  now = new Date(),
  warn = console.warn
} = {}) {
  const hoyDate = madridDate(now);
  const mananaDate = addDays(hoyDate, 1);

  const todayRows = parseEsios(today, 'today_price', warn);
  const tomorrowRows = parseEsios(tomorrow, 'tomorrow_price', warn);
  const omieRows = parseOmie(omie, warn);

  const hoyPrices = hourlyPrices(todayRows, hoyDate);
  const hoy = { ...describeDate(hoyDate) };
  if (hoyPrices.length) {
    Object.assign(
      hoy,
      { fuente: 'ESIOS', hayDatos: true },
      priceSummary(hoyPrices),
      franjaPrices(hoyPrices, hoy.esLaborable)
    );
  } else {
    Object.assign(hoy, { fuente: null, hayDatos: false });
    warn(
      `today_price no contiene ${hoy.fechaIso}: los precios de hoy quedan con su fallback`
    );
  }

  const manana = { ...describeDate(mananaDate) };
  const esiosPrices = hourlyPrices(tomorrowRows, mananaDate);
  const omiePrices = esiosPrices.length
    ? []
    : hourlyPrices(omieRows, mananaDate);
  if (esiosPrices.length) {
    Object.assign(
      manana,
      { estado: 'C', fuente: 'ESIOS', hayDatos: true },
      priceSummary(esiosPrices),
      franjaPrices(esiosPrices, manana.esLaborable)
    );
  } else if (omiePrices.length) {
    Object.assign(
      manana,
      { estado: 'B', fuente: 'OMIE', hayDatos: true },
      priceSummary(omiePrices),
      franjaPrices(omiePrices, manana.esLaborable)
    );
  } else {
    Object.assign(manana, { estado: 'A', fuente: null, hayDatos: false });
  }

  return { hoy, manana };
}

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function lookup(ctx, path) {
  return path
    .split('.')
    .reduce((node, key) => (node == null ? undefined : node[key]), ctx);
}

const MARKER_RE = /<!--dd:([^>]*?)-->|<!--\/dd-->/g;
const VALUE_RE = /^[a-zA-Z]+\.[a-zA-Z]+$/;
const IF_RE = /^if ([a-zA-Z]+\.[a-zA-Z]+)(?:=([^\s]+))?$/;

// Parsea los marcadores a un árbol. Devuelve null si están desbalanceados o
// alguno no es válido.
function parseMarkers(html, warn) {
  const root = { children: [] };
  const stack = [root];
  let cursor = 0;
  for (const match of html.matchAll(MARKER_RE)) {
    const parent = stack[stack.length - 1];
    if (match.index > cursor) {
      parent.children.push(html.slice(cursor, match.index));
    }
    cursor = match.index + match[0].length;

    if (match[1] === undefined) {
      if (stack.length === 1) {
        warn(`<!--/dd--> sin apertura en la posición ${match.index}`);
        return null;
      }
      stack.pop();
      continue;
    }

    const directive = match[1].trim();
    let node;
    const ifMatch = directive.match(IF_RE);
    if (ifMatch) {
      node = {
        type: 'if',
        path: ifMatch[1],
        expected: ifMatch[2],
        children: []
      };
    } else if (VALUE_RE.test(directive)) {
      node = { type: 'value', path: directive, children: [] };
    } else {
      warn(`placeholder no válido: <!--dd:${match[1]}-->`);
      return null;
    }
    parent.children.push(node);
    stack.push(node);
  }
  if (stack.length > 1) {
    warn(`<!--dd:${stack[stack.length - 1].path}--> sin cierre <!--/dd-->`);
    return null;
  }
  root.children.push(html.slice(cursor));
  return root;
}

function render(nodes, ctx, warn) {
  let out = '';
  for (const node of nodes) {
    if (typeof node === 'string') {
      out += node;
      continue;
    }
    const value = lookup(ctx, node.path);
    if (node.type === 'value') {
      if (value === undefined || value === null || value === '') {
        warn(`sin dato para ${node.path}: se deja el fallback`);
        out += render(node.children, ctx, warn);
      } else {
        out += escapeHtml(value);
      }
      continue;
    }
    if (value === undefined) {
      warn(`clave desconocida en if: ${node.path}`);
      continue;
    }
    const matches =
      node.expected === undefined
        ? Boolean(value)
        : String(value) === node.expected;
    if (matches) out += render(node.children, ctx, warn);
  }
  return out;
}

export function applyPlaceholders(html, ctx, warn = console.warn) {
  if (!html.includes('<!--dd:') && !html.includes('<!--/dd-->')) return html;
  const tree = parseMarkers(html, warn);
  if (!tree) return html;
  return render(tree.children, ctx || {}, warn);
}

function readJson(file, warn) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    warn(`no se pudo leer ${file}: ${error.message}`);
    return null;
  }
}

export function dailyDataPlugin({ dataDir = 'public/data' } = {}) {
  let dir = dataDir;
  let logger;
  let ctx = null;
  const warn = message =>
    logger
      ? logger.warn(`[daily-data] ${message}`)
      : console.warn(`[daily-data] ${message}`);

  return {
    name: 'daily-data',
    apply: 'build',
    configResolved(config) {
      dir = resolve(config.root, dataDir);
      logger = config.logger;
    },
    buildStart() {
      ctx = computeDailyContext({
        today: readJson(resolve(dir, 'today_price.json'), warn),
        tomorrow: readJson(resolve(dir, 'tomorrow_price.json'), warn),
        omie: readJson(resolve(dir, 'omie_data.json'), warn),
        now: new Date(),
        warn
      });
      const info = `[daily-data] hoy ${ctx.hoy.fechaIso}, mañana ${ctx.manana.fechaIso} en estado ${ctx.manana.estado}`;
      logger ? logger.info(info) : console.info(info);
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return applyPlaceholders(html, ctx, warn);
      }
    }
  };
}
