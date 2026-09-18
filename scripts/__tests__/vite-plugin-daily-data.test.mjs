process.env.TZ = 'UTC';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as dailyData from '../vite-plugin-daily-data.mjs';

const { computeDailyContext, applyPlaceholders, dailyDataPlugin } = dailyData;

// 18 sep 2026 a las 10:00 en Madrid (CEST, UTC+2).
const NOW = new Date('2026-09-18T08:00:00Z');

function esiosDay(day, prices) {
  return prices.map((price, hour) => ({ day, hour, price, zone: 'valle' }));
}

function flatPrices(base = 0.1) {
  return Array.from({ length: 24 }, (_, hour) => base + hour / 1000);
}

function omieDay(year, month, day, hourlyPrices) {
  const rows = [];
  hourlyPrices.forEach((price, hour) => {
    for (let quarter = 0; quarter < 4; quarter++) {
      const period = hour * 4 + quarter;
      // Los cuatro cuartos de cada hora promedian exactamente `price`.
      const offset = [-0.002, 0.002, -0.001, 0.001][quarter];
      rows.push({
        year,
        month,
        day,
        hour: period,
        price: price + offset,
        pricemin: price + offset
      });
    }
  });
  rows.push({ year: '*\r', hour: null, price: null, pricemin: null });
  return rows;
}

function collectWarnings() {
  const messages = [];
  const warn = message => messages.push(message);
  return { messages, warn };
}

test('estado C: tomorrow_price contiene mañana (ESIOS)', () => {
  const prices = flatPrices(0.15);
  prices[3] = 0.02;
  prices[20] = 0.33;
  const { warn, messages } = collectWarnings();
  const ctx = computeDailyContext({
    today: esiosDay('18/09/2026', flatPrices()),
    tomorrow: esiosDay('19/09/2026', prices),
    omie: omieDay('2026', '09', '19', flatPrices(0.5)),
    now: NOW,
    warn
  });

  assert.equal(ctx.manana.estado, 'C');
  assert.equal(ctx.manana.fuente, 'ESIOS');
  assert.equal(ctx.manana.hayDatos, true);
  assert.equal(ctx.manana.fechaLarga, 'sábado 19 de septiembre');
  assert.equal(ctx.manana.diaSemana, 'sábado');
  assert.equal(ctx.manana.fechaIso, '2026-09-19');
  assert.equal(ctx.manana.horaMasBarata, 'de 03:00 a 04:00');
  assert.equal(ctx.manana.precioMasBarato, '0,020');
  assert.equal(ctx.manana.horaMasCara, 'de 20:00 a 21:00');
  assert.equal(ctx.manana.precioMasCaro, '0,330');
  const mean = prices.reduce((a, b) => a + b, 0) / 24;
  assert.equal(ctx.manana.precioMedio, mean.toFixed(3).replace('.', ','));
  assert.deepEqual(messages, []);
});

test('estado B: solo OMIE tiene mañana, en cuartos de hora', () => {
  const hourly = flatPrices(0.12);
  hourly[5] = 0.01;
  hourly[21] = 0.4;
  const ctx = computeDailyContext({
    today: esiosDay('18/09/2026', flatPrices()),
    tomorrow: esiosDay('18/09/2026', flatPrices()),
    omie: omieDay('2026', '09', '19', hourly),
    now: NOW,
    warn: () => {}
  });

  assert.equal(ctx.manana.estado, 'B');
  assert.equal(ctx.manana.fuente, 'OMIE');
  assert.equal(ctx.manana.horaMasBarata, 'de 05:00 a 06:00');
  assert.equal(ctx.manana.precioMasBarato, '0,010');
  assert.equal(ctx.manana.horaMasCara, 'de 21:00 a 22:00');
  assert.equal(ctx.manana.precioMasCaro, '0,400');
});

test('estado B también acepta OMIE horario (24 periodos)', () => {
  const hourly = flatPrices(0.12);
  const omie = hourly.map((price, hour) => ({
    year: '2026',
    month: '09',
    day: '19',
    hour,
    price
  }));
  const ctx = computeDailyContext({
    today: esiosDay('18/09/2026', flatPrices()),
    tomorrow: [],
    omie,
    now: NOW,
    warn: () => {}
  });
  assert.equal(ctx.manana.estado, 'B');
  assert.equal(ctx.manana.horaMasCara, 'de 23:00 a 24:00');
});

test('estado A: ningún JSON contiene mañana', () => {
  const ctx = computeDailyContext({
    today: esiosDay('18/09/2026', flatPrices()),
    tomorrow: esiosDay('18/09/2026', flatPrices()),
    omie: omieDay('2026', '09', '18', flatPrices()),
    now: NOW,
    warn: () => {}
  });

  assert.equal(ctx.manana.estado, 'A');
  assert.equal(ctx.manana.fuente, null);
  assert.equal(ctx.manana.hayDatos, false);
  assert.equal(ctx.manana.fechaLarga, 'sábado 19 de septiembre');
  assert.equal(ctx.manana.precioMedio, undefined);
  assert.equal(ctx.manana.horaMasBarata, undefined);
  assert.equal(ctx.hoy.hayDatos, true);
});

test('JSON vacío, null o malformado: no rompe, avisa y queda en estado A', () => {
  for (const bad of [[], null, undefined, {}, 'texto', [{ foo: 1 }, null]]) {
    const { warn, messages } = collectWarnings();
    const ctx = computeDailyContext({
      today: bad,
      tomorrow: bad,
      omie: bad,
      now: NOW,
      warn
    });
    assert.equal(ctx.manana.estado, 'A');
    assert.equal(ctx.hoy.hayDatos, false);
    assert.equal(ctx.hoy.fuente, null);
    assert.equal(ctx.hoy.fechaLarga, 'viernes 18 de septiembre');
    assert.ok(messages.length > 0, `sin avisos para ${JSON.stringify(bad)}`);
  }
});

test('hoy desfasado (Flat falla): today_price es de ayer', () => {
  const { warn, messages } = collectWarnings();
  const ctx = computeDailyContext({
    today: esiosDay('17/09/2026', flatPrices()),
    tomorrow: esiosDay('17/09/2026', flatPrices()),
    omie: [],
    now: NOW,
    warn
  });
  assert.equal(ctx.hoy.hayDatos, false);
  assert.equal(ctx.hoy.precioMedio, undefined);
  assert.equal(ctx.hoy.fechaLarga, 'viernes 18 de septiembre');
  assert.equal(ctx.manana.estado, 'A');
  assert.ok(messages.some(m => m.includes('2026-09-18')));
});

test('cambio de mes: 30 sep → 1 oct', () => {
  const ctx = computeDailyContext({
    today: esiosDay('30/09/2026', flatPrices()),
    tomorrow: esiosDay('01/10/2026', flatPrices()),
    omie: [],
    now: new Date('2026-09-30T10:00:00Z'),
    warn: () => {}
  });
  assert.equal(ctx.hoy.fechaLarga, 'miércoles 30 de septiembre');
  assert.equal(ctx.manana.fechaLarga, 'jueves 1 de octubre');
  assert.equal(ctx.manana.estado, 'C');
});

test('cambio de año: 31 dic → 1 ene, y ESIOS del año anterior no cuenta', () => {
  const now = new Date('2026-12-31T12:00:00Z');
  const ctx = computeDailyContext({
    today: esiosDay('31/12/2026', flatPrices()),
    tomorrow: esiosDay('01/01/2027', flatPrices()),
    omie: [],
    now,
    warn: () => {}
  });
  assert.equal(ctx.hoy.fechaLarga, 'jueves 31 de diciembre');
  assert.equal(ctx.manana.fechaLarga, 'viernes 1 de enero');
  assert.equal(ctx.manana.fechaIso, '2027-01-01');
  assert.equal(ctx.manana.estado, 'C');

  const stale = computeDailyContext({
    today: esiosDay('31/12/2026', flatPrices()),
    tomorrow: esiosDay('01/01/2026', flatPrices()),
    omie: [],
    now,
    warn: () => {}
  });
  assert.equal(stale.manana.estado, 'A');
});

test('zona horaria: 23:30 UTC es el día siguiente en Madrid (TZ=UTC)', () => {
  assert.equal(new Date('2026-12-31T23:30:00Z').getDate(), 31);
  const winter = computeDailyContext({
    today: esiosDay('01/01/2027', flatPrices()),
    tomorrow: [],
    omie: omieDay('2027', '01', '02', flatPrices()),
    now: new Date('2026-12-31T23:30:00Z'),
    warn: () => {}
  });
  assert.equal(winter.hoy.fechaLarga, 'viernes 1 de enero');
  assert.equal(winter.hoy.hayDatos, true);
  assert.equal(winter.manana.fechaLarga, 'sábado 2 de enero');
  assert.equal(winter.manana.estado, 'B');

  // En verano (UTC+2) el cambio de día llega a las 22:00 UTC.
  const summerBefore = computeDailyContext({
    now: new Date('2026-09-18T21:59:00Z'),
    warn: () => {}
  });
  const summerAfter = computeDailyContext({
    now: new Date('2026-09-18T22:30:00Z'),
    warn: () => {}
  });
  assert.equal(summerBefore.hoy.fechaIso, '2026-09-18');
  assert.equal(summerAfter.hoy.fechaIso, '2026-09-19');
});

test('formato de precios y horas; empates a la hora más temprana', () => {
  const prices = Array(24).fill(0.2);
  const ctx = computeDailyContext({
    today: esiosDay('18/09/2026', prices),
    tomorrow: [],
    omie: [],
    now: NOW,
    warn: () => {}
  });
  assert.equal(ctx.hoy.precioMedio, '0,200');
  assert.equal(ctx.hoy.precioMasBarato, '0,200');
  assert.equal(ctx.hoy.horaMasBarata, 'de 00:00 a 01:00');
  assert.equal(ctx.hoy.horaMasCara, 'de 00:00 a 01:00');

  const last = Array(24).fill(0.1);
  last[23] = 0.1234;
  const ctx2 = computeDailyContext({
    today: esiosDay('18/09/2026', last),
    now: NOW,
    warn: () => {}
  });
  assert.equal(ctx2.hoy.horaMasCara, 'de 23:00 a 24:00');
  assert.equal(ctx2.hoy.precioMasCaro, '0,123');
});

const CTX = {
  hoy: {
    fechaLarga: 'viernes 18 de septiembre',
    precioMedio: '0,178',
    hayDatos: true
  },
  manana: {
    fechaLarga: 'sábado 19 de septiembre',
    estado: 'B',
    fuente: 'OMIE',
    hayDatos: true
  }
};

test('applyPlaceholders: sustituye valores y elimina los marcadores', () => {
  const html =
    '<title>Precio luz <!--dd:hoy.fechaLarga-->hoy<!--/dd--></title>' +
    '<p>Medio: <!--dd:hoy.precioMedio-->consulta la tabla<!--/dd--> €/kWh</p>';
  assert.equal(
    applyPlaceholders(html, CTX, () => {}),
    '<title>Precio luz viernes 18 de septiembre</title><p>Medio: 0,178 €/kWh</p>'
  );
});

test('applyPlaceholders: deja el fallback cuando falta el dato', () => {
  const { warn, messages } = collectWarnings();
  const html =
    '<h1>Mañana <!--dd:manana.precioMedio-->consulta la tabla<!--/dd--></h1>';
  assert.equal(
    applyPlaceholders(html, CTX, warn),
    '<h1>Mañana consulta la tabla</h1>'
  );
  assert.equal(
    applyPlaceholders(html, null, () => {}),
    '<h1>Mañana consulta la tabla</h1>'
  );
  assert.ok(messages.some(m => m.includes('manana.precioMedio')));
});

test('applyPlaceholders: bloques if por estado, truthy y anidados', () => {
  const html =
    '<!--dd:if manana.estado=A-->sin datos<!--/dd-->' +
    '<!--dd:if manana.estado=B-->avance <!--dd:manana.fechaLarga-->mañana<!--/dd--><!--/dd-->' +
    '<!--dd:if manana.estado=C-->completo<!--/dd-->' +
    '<!--dd:if hoy.hayDatos-->[hoy]<!--/dd-->';
  assert.equal(
    applyPlaceholders(html, CTX, () => {}),
    'avance sábado 19 de septiembre[hoy]'
  );
});

test('applyPlaceholders: if con clave desconocida se elimina y avisa', () => {
  const { warn, messages } = collectWarnings();
  const html = 'a<!--dd:if manana.noExiste-->b<!--/dd-->c';
  assert.equal(applyPlaceholders(html, CTX, warn), 'ac');
  assert.equal(messages.length, 1);
});

test('applyPlaceholders: escapa HTML en los valores', () => {
  const ctx = { hoy: { fechaLarga: '<b>"x" & y</b>' } };
  assert.equal(
    applyPlaceholders('<!--dd:hoy.fechaLarga-->f<!--/dd-->', ctx, () => {}),
    '&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;'
  );
});

test('applyPlaceholders: HTML sin marcadores se devuelve idéntico', () => {
  const html = '<!doctype html><!-- comentario normal --><p>hola</p>';
  assert.equal(
    applyPlaceholders(html, CTX, () => {
      throw new Error('no debe avisar');
    }),
    html
  );
});

test('applyPlaceholders: marcadores desbalanceados o inválidos devuelven el original', () => {
  const cases = [
    '<!--dd:hoy.fechaLarga-->sin cierre',
    'cierre suelto<!--/dd-->',
    '<!--dd:if hoy.fechaLarga-->a<!--dd:hoy.precioMedio-->b<!--/dd-->',
    '<!--dd:esto no vale-->x<!--/dd-->'
  ];
  for (const html of cases) {
    const { warn, messages } = collectWarnings();
    assert.equal(applyPlaceholders(html, CTX, warn), html);
    assert.equal(messages.length, 1, html);
  }
});

test('el módulo exporta solo el plugin y las dos funciones puras', () => {
  assert.deepEqual(Object.keys(dailyData).sort(), [
    'applyPlaceholders',
    'computeDailyContext',
    'dailyDataPlugin'
  ]);
});

test('plugin: con JSON corrupto o ausente no rompe y deja el fallback', () => {
  const dir = mkdtempSync(join(tmpdir(), 'daily-data-'));
  try {
    writeFileSync(join(dir, 'today_price.json'), '{ corrupto');
    writeFileSync(join(dir, 'tomorrow_price.json'), '');
    // omie_data.json no existe
    const { warn, messages } = collectWarnings();
    const plugin = dailyDataPlugin({ dataDir: dir });
    plugin.configResolved({ root: '/', logger: { warn, info: () => {} } });
    plugin.buildStart();

    assert.equal(plugin.apply, 'build');
    assert.equal(plugin.transformIndexHtml.order, 'pre');
    const html =
      '<h1>Precio <!--dd:hoy.precioMedio-->de hoy<!--/dd--> ' +
      '<!--dd:hoy.fechaLarga-->hoy<!--/dd--></h1>';
    const out = plugin.transformIndexHtml.handler(html);
    assert.match(out, /^<h1>Precio de hoy \S+ \d+ de \S+<\/h1>$/);
    assert.ok(messages.filter(m => m.includes('no se pudo leer')).length === 3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
