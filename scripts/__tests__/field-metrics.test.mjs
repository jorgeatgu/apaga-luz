import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startFieldMetrics } from '../../source/javascript/field-metrics.js';

const PROD = {
  hostname: 'www.apaga-luz.com',
  search: '',
  pathname: '/precio-luz-manana/'
};

// `onX` falsos: guardan el callback para dispararlo a mano con métricas de ejemplo.
function fakeLibrary() {
  const callbacks = {};
  const options = {};
  const library = {};
  for (const name of ['CLS', 'LCP', 'INP', 'FCP', 'TTFB']) {
    library[`on${name}`] = (callback, opts) => {
      callbacks[name] = callback;
      options[name] = opts;
    };
  }
  return { library, callbacks, options };
}

function spySend() {
  const sent = [];
  const send = (name, params) => sent.push({ name, params });
  return { sent, send };
}

test('CLS se envía ×1000 con el formato de evento de siempre', () => {
  const { library, callbacks } = fakeLibrary();
  const { sent, send } = spySend();
  startFieldMetrics({ ...library, send, location: PROD });

  callbacks.CLS({ name: 'CLS', value: 0.0734, rating: 'good', delta: 0.0034 });

  assert.deepEqual(sent, [
    {
      name: 'CLS',
      params: {
        value: 73,
        metric_rating: 'good',
        metric_delta: 0.0034,
        non_interaction: true,
        page_path: '/precio-luz-manana/'
      }
    }
  ]);
});

const INP = {
  name: 'INP',
  value: 312,
  rating: 'poor',
  delta: 312,
  attribution: {
    interactionTarget: 'button.menu-toggle',
    inputDelay: 201.6,
    processingDuration: 8.2,
    presentationDelay: 102.2,
    loadState: 'dom-content-loaded',
    longestScript: {
      entry: {
        sourceURL: 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0',
        invoker: 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0',
        invokerType: 'classic-script'
      },
      subpart: 'input-delay',
      intersectingDuration: 190
    }
  }
};

test('INP lleva los siete parámetros de atribución con sus nombres actuales', () => {
  const { library, callbacks } = fakeLibrary();
  const { sent, send } = spySend();
  startFieldMetrics({ ...library, send, location: PROD });

  callbacks.INP(INP);

  assert.deepEqual(sent, [
    {
      name: 'INP',
      params: {
        value: 312,
        metric_rating: 'poor',
        metric_delta: 312,
        non_interaction: true,
        page_path: '/precio-luz-manana/',
        metric_target: 'button.menu-toggle',
        inp_phase: 'input_delay',
        input_delay: 202,
        processing_duration: 8,
        presentation_delay: 102,
        load_state: 'dom-content-loaded',
        top_script: 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0'
      }
    }
  ]);
});

test('registra las cinco métricas y no muestrea: 100 de 100 envíos', () => {
  const { library, callbacks } = fakeLibrary();
  const { sent, send } = spySend();
  startFieldMetrics({ ...library, send, location: PROD });

  assert.deepEqual(Object.keys(callbacks).sort(), [
    'CLS',
    'FCP',
    'INP',
    'LCP',
    'TTFB'
  ]);
  for (let visit = 0; visit < 20; visit++) {
    callbacks.CLS({ name: 'CLS', value: 0.01, rating: 'good', delta: 0.01 });
    callbacks.LCP({ name: 'LCP', value: 1800, rating: 'good', delta: 1800 });
    callbacks.FCP({ name: 'FCP', value: 900, rating: 'good', delta: 900 });
    callbacks.TTFB({ name: 'TTFB', value: 200, rating: 'good', delta: 200 });
    callbacks.INP({ ...INP, rating: 'good', value: 40 });
  }
  assert.equal(sent.length, 100);
});

test('en localhost no se registra nada salvo con ?debug=true', () => {
  for (const hostname of ['localhost', '127.0.0.1']) {
    const { library, callbacks } = fakeLibrary();
    const { send } = spySend();
    const started = startFieldMetrics({
      ...library,
      send,
      location: { hostname, search: '', pathname: '/' }
    });
    assert.equal(started, false);
    assert.deepEqual(callbacks, {});
  }

  const { library, callbacks, options } = fakeLibrary();
  const { send } = spySend();
  const started = startFieldMetrics({
    ...library,
    send,
    location: { hostname: 'localhost', search: '?debug=true', pathname: '/' }
  });
  assert.equal(started, true);
  assert.equal(Object.keys(callbacks).length, 5);
  // En debug se ve cada interacción, no solo la del final de la visita.
  assert.deepEqual(options.INP, { reportAllChanges: true });
});

test('INP sin script largo: top_script es none y la fase dominante sale de los tiempos', () => {
  const { library, callbacks } = fakeLibrary();
  const { sent, send } = spySend();
  startFieldMetrics({ ...library, send, location: PROD });

  callbacks.INP({
    ...INP,
    value: 40,
    attribution: {
      interactionTarget: '#tramos',
      inputDelay: 2,
      processingDuration: 5,
      presentationDelay: 26,
      loadState: 'complete',
      longAnimationFrameEntries: []
    }
  });

  assert.equal(sent[0].params.inp_phase, 'presentation');
  assert.equal(sent[0].params.top_script, 'none');
});
