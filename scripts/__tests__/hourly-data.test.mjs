import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processHourlyData } from '../../source/javascript/hourly-data.js';

// Jueves 19 nov 2026 y domingo 25 oct 2026 (cambio de hora, 25 horas)
const THURSDAY = new Date(2026, 10, 19, 12);
const DST_SUNDAY = new Date(2026, 9, 25, 12);

// Precio creciente con la hora: las 8 primeras son las más baratas
function day(hours) {
  return Array.from({ length: hours }, (_, hour) => ({
    day: '19/11/2026',
    hour,
    price: (100 + hour) / 1000,
    zone: 'valle'
  }));
}

test('24 horas en laborable: tramos, colores y horas pasadas', () => {
  const result = processHourlyData(day(24), 12, THURSDAY);

  assert.equal(result.length, 24);
  const tramoAt = hour => result.find(element => element.hour === hour).tramo;
  assert.equal(tramoAt(0), 'valle');
  assert.equal(tramoAt(7), 'valle');
  assert.equal(tramoAt(8), 'llano');
  assert.equal(tramoAt(10), 'punta');
  assert.equal(tramoAt(14), 'llano');
  assert.equal(tramoAt(18), 'punta');
  assert.equal(tramoAt(22), 'llano');
  assert.equal(tramoAt(23), 'llano');

  const colors = result.map(({ priceColor }) => priceColor);
  assert.deepEqual(colors.slice(0, 8), Array(8).fill('price-green'));
  assert.deepEqual(colors.slice(8, 16), Array(8).fill('price-yellow'));
  assert.deepEqual(colors.slice(16, 24), Array(8).fill('price-red'));

  assert.equal(result[11].hourHasPassed, true);
  assert.equal(result[12].hourHasPassed, false);
  assert.equal(result[5].price, '0.105');
  assert.equal(result[5].originalPrice, 0.105);
});

test('25 horas del cambio de hora: la hora 24 sigue y todas tienen tramo y color', () => {
  const result = processHourlyData(day(25), 3, DST_SUNDAY);

  assert.equal(result.length, 25);
  assert.equal(result.filter(({ hour }) => hour === 24).length, 1);
  assert.deepEqual(
    result.map(({ tramo }) => tramo),
    Array(25).fill('valle')
  );
  assert.ok(result.every(({ priceColor }) => priceColor !== undefined));
});

test('25 horas en laborable: ninguna hora sin tramo', () => {
  const result = processHourlyData(day(25), 3, THURSDAY);

  assert.equal(result.length, 25);
  assert.ok(result.every(({ tramo }) => tramo !== undefined));
});
