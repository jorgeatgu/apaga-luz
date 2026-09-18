import { test } from 'node:test';
import assert from 'node:assert/strict';
import { omie_hourly_prices } from '../../source/javascript/omie.js';

const quarter = (hour, price) => ({
  year: '2026',
  month: '09',
  day: '19',
  hour,
  price
});

test('promedia 96 cuartos de hora en 24 horas', () => {
  const data = Array.from({ length: 96 }, (_, i) =>
    quarter(i, i % 4 === 0 ? 0.1 : 0.2)
  );
  const hours = omie_hourly_prices(data);
  assert.equal(hours.length, 24);
  assert.deepEqual(
    hours.map(({ hour }) => hour),
    [...Array(24).keys()]
  );
  assert.ok(Math.abs(hours[0].price - 0.175) < 1e-12);
  assert.equal(hours[5].day, '19');
});

test('deja igual los datos horarios', () => {
  const data = Array.from({ length: 24 }, (_, i) => quarter(i, i / 100));
  assert.deepEqual(omie_hourly_prices(data), data);
});

test('conserva el precio 0 y descarta filas sin precio', () => {
  const data = [
    quarter(0, 0),
    quarter(1, 0.05),
    { day: undefined, hour: 0, price: null }
  ];
  assert.deepEqual(
    omie_hourly_prices(data).map(({ price }) => price),
    [0, 0.05]
  );
});
