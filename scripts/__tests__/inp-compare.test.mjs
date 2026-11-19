import { test } from 'node:test';
import assert from 'node:assert/strict';

import { compareSummaries } from '../inp/compare.mjs';

function interaction(page, id, inp, icp = null) {
  return { page, id, inp: { median: inp }, icp };
}

function result(...interactions) {
  return { summary: { interactions } };
}

const BASE = result(
  interaction('/', 'tramos', 40, 42),
  interaction('/precio-luz-manana/', 'ordenar-precio', 32, 237),
  interaction('/precio-luz-manana/', 'details', 32)
);

test('un resultado contra sí mismo no tiene regresiones', () => {
  const report = compareSummaries(BASE, BASE);
  assert.deepEqual(report.regressions, []);
  assert.deepEqual(report.missing, []);
  assert.equal(report.ok, true);
});

test('el INP que sube más de 8 ms es una regresión', () => {
  const next = result(
    interaction('/', 'tramos', 49, 42),
    interaction('/precio-luz-manana/', 'ordenar-precio', 32, 237),
    interaction('/precio-luz-manana/', 'details', 32)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.regressions, [
    { page: '/', id: 'tramos', metric: 'inp', base: 40, next: 49, delta: 9 }
  ]);
  assert.equal(report.ok, false);
});

test('subir 8 ms o menos, o bajar, pasa', () => {
  const next = result(
    interaction('/', 'tramos', 48, 50),
    interaction('/precio-luz-manana/', 'ordenar-precio', 16, 40),
    interaction('/precio-luz-manana/', 'details', 32)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.regressions, []);
  assert.equal(report.ok, true);
});

test('el ICP que sube más de 8 ms es una regresión aunque el INP no se mueva', () => {
  const next = result(
    interaction('/', 'tramos', 40, 42),
    interaction('/precio-luz-manana/', 'ordenar-precio', 32, 246),
    interaction('/precio-luz-manana/', 'details', 32)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.regressions, [
    {
      page: '/precio-luz-manana/',
      id: 'ordenar-precio',
      metric: 'icp',
      base: 237,
      next: 246,
      delta: 9
    }
  ]);
});

test('una interacción que falta en el resultado nuevo se señala y falla', () => {
  const next = result(
    interaction('/', 'tramos', 40, 42),
    interaction('/precio-luz-manana/', 'details', 32)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.regressions, []);
  assert.deepEqual(report.missing, [
    { page: '/precio-luz-manana/', id: 'ordenar-precio', metric: 'inp' }
  ]);
  assert.equal(report.ok, false);
});

test('un ICP que desaparece se señala; sin ICP en los dos se ignora', () => {
  const next = result(
    interaction('/', 'tramos', 40, null),
    interaction('/precio-luz-manana/', 'ordenar-precio', 32, 237),
    interaction('/precio-luz-manana/', 'details', 32)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.regressions, []);
  assert.deepEqual(report.missing, [
    { page: '/', id: 'tramos', metric: 'icp' }
  ]);
  assert.equal(report.ok, false);
});

test('una interacción nueva solo se informa y no falla', () => {
  const next = result(
    ...BASE.summary.interactions,
    interaction('/graficas/', 'menu', 32, 54)
  );
  const report = compareSummaries(BASE, next);
  assert.deepEqual(report.added, [{ page: '/graficas/', id: 'menu' }]);
  assert.equal(report.ok, true);
});

test('una métrica que no estaba en la base se informa y no falla', () => {
  const base = result(
    interaction('/precio-luz-manana/', 'order-price', null, null)
  );
  const next = result(
    interaction('/precio-luz-manana/', 'order-price', 32, 237)
  );
  const report = compareSummaries(base, next);
  assert.deepEqual(report.added, [
    { page: '/precio-luz-manana/', id: 'order-price', metric: 'inp' },
    { page: '/precio-luz-manana/', id: 'order-price', metric: 'icp' }
  ]);
  assert.equal(report.ok, true);
});
