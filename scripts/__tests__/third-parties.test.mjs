import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startThirdParties } from '../../source/javascript/third-parties.js';

const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0';

// Documento y reloj falsos: guardan lo que el módulo engancha para dispararlo a mano
function fakePage() {
  const listeners = [];
  const appended = [];
  const timers = [];
  const window = {};
  const document = {
    head: { appendChild: node => appended.push(node) },
    createElement: tagName => ({ tagName }),
    addEventListener: (type, listener, options) =>
      listeners.push({ type, listener, options })
  };
  const setTimeout = (callback, delay) => timers.push({ callback, delay });
  const gesture = type =>
    listeners.filter(l => l.type === type).forEach(l => l.listener());
  return { window, document, setTimeout, listeners, appended, timers, gesture };
}

test('varios gestos cargan gtag una sola vez', () => {
  const page = fakePage();
  startThirdParties(page);

  page.gesture('touchstart');
  page.gesture('click');
  page.gesture('scroll');

  assert.equal(page.appended.length, 1);
  assert.equal(page.appended[0].src, GTAG_SRC);
  assert.equal(page.appended[0].async, true);
});

test('escucha el primer click, scroll, keydown o touchstart, una vez y en pasivo', () => {
  const page = fakePage();
  startThirdParties(page);

  assert.deepEqual(
    page.listeners.map(({ type, options }) => [type, options]),
    ['click', 'scroll', 'keydown', 'touchstart'].map(type => [
      type,
      { once: true, passive: true }
    ])
  );
});

test('sin gestos, gtag carga a los 5 s', () => {
  const page = fakePage();
  startThirdParties(page);

  assert.equal(page.appended.length, 0);
  assert.equal(page.timers.length, 1);
  assert.equal(page.timers[0].delay, 5000);

  page.timers[0].callback();
  assert.equal(page.appended.length, 1);
  assert.equal(page.appended[0].src, GTAG_SRC);
});

test('si el gesto llega antes, el disparo de los 5 s no vuelve a cargarlo', () => {
  const page = fakePage();
  startThirdParties(page);

  page.gesture('keydown');
  page.timers[0].callback();
  assert.equal(page.appended.length, 1);
});

test('el stub encola en dataLayer y el onload añade js y config', () => {
  const page = fakePage();
  startThirdParties(page);

  page.window.gtag('event', 'INP', { value: 120 });
  page.gesture('click');
  page.appended[0].onload();

  const calls = page.window.dataLayer.map(entry => Array.from(entry));
  assert.deepEqual(calls[0], ['event', 'INP', { value: 120 }]);
  assert.equal(calls[1][0], 'js');
  assert.ok(calls[1][1] instanceof Date);
  assert.deepEqual(calls[2], ['config', 'G-E9V8ZPM3P0']);
  // gtag.js espera objetos `arguments`, no arrays
  assert.ok(!Array.isArray(page.window.dataLayer[0]));
});

test('conserva lo que ya hubiera en dataLayer', () => {
  const page = fakePage();
  page.window.dataLayer = [{ previo: true }];
  startThirdParties(page);

  page.window.gtag('event', 'x');
  assert.deepEqual(page.window.dataLayer[0], { previo: true });
  assert.equal(page.window.dataLayer.length, 2);
});
