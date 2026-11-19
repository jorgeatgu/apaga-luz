import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  FIELD_METRICS_ENTRY,
  THIRD_PARTIES_ENTRY,
  findThirdPartyCopies,
  injectFieldMetrics,
  thirdPartiesPlugin
} from '../vite-plugin-third-parties.mjs';
import config from '../../vite.config.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const ENTRY_TAG = `<script type="module" src="${FIELD_METRICS_ENTRY}"></script>`;
const THIRD_PARTIES_TAG = `<script type="module" src="${THIRD_PARTIES_ENTRY}"></script>`;
const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8990231994528437';
const count = (html, needle) => html.split(needle).length - 1;

function transform(html, entry = 'index.html') {
  const plugin = thirdPartiesPlugin();
  return plugin.transformIndexHtml.handler(html, {
    filename: `${ROOT}${entry}`,
    path: `/${entry}`
  });
}

test('inyecta la entrada de la medición de campo una vez, antes de </head>', () => {
  const html =
    '<!doctype html><html><head><title>x</title></head><body><p>hola</p></body></html>';
  assert.equal(
    injectFieldMetrics(html),
    `<!doctype html><html><head><title>x</title>${ENTRY_TAG}\n</head><body><p>hola</p></body></html>`
  );
});

test('si la medición de campo se inyecta dos veces no se duplica', () => {
  const html = '<html><head></head><body></body></html>';
  assert.equal(
    count(injectFieldMetrics(injectFieldMetrics(html)), FIELD_METRICS_ENTRY),
    1
  );
});

test('inyecta AdSense, los preconnect y el módulo de terceros antes que la medición de campo', () => {
  const out = transform(
    '<html><head><title>x</title></head><body></body></html>'
  );
  const head = out.slice(0, out.indexOf('</head>'));

  assert.equal(count(out, THIRD_PARTIES_TAG), 1);
  assert.equal(count(out, ENTRY_TAG), 1);
  assert.equal(
    count(
      out,
      `<script defer src="${ADSENSE_SRC}" crossorigin="anonymous"></script>`
    ),
    1
  );
  assert.equal(
    count(
      out,
      '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>'
    ),
    1
  );
  assert.equal(
    count(
      out,
      '<link rel="preconnect" href="https://www.googletagmanager.com">'
    ),
    1
  );
  // Todo en el <head>, y el stub de gtag antes de la medición de campo que lo usa
  assert.ok(head.includes(ADSENSE_SRC));
  assert.ok(head.indexOf(ADSENSE_SRC) < head.indexOf(THIRD_PARTIES_TAG));
  assert.ok(head.indexOf(THIRD_PARTIES_TAG) < head.indexOf(ENTRY_TAG));
});

test('politica-de-privacidad lleva el módulo de terceros pero no AdSense', () => {
  const out = transform(
    '<html><head></head><body></body></html>',
    'politica-de-privacidad/index.html'
  );
  assert.equal(count(out, THIRD_PARTIES_TAG), 1);
  assert.equal(count(out, 'adsbygoogle.js'), 0);
  assert.equal(count(out, 'pagead2.googlesyndication.com'), 0);
});

test('anti-copias: un HTML con su propio bloque de GA4 o de AdSense hace fallar el plugin', () => {
  const withGa = `<html><head>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <script>
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0';
  </script>
</head><body></body></html>`;
  const withAdsense = `<html><head>
  <script defer src="${ADSENSE_SRC}" crossorigin="anonymous" data-optimized="true"></script>
</head><body></body></html>`;

  assert.ok(findThirdPartyCopies(withGa).length > 0);
  assert.ok(findThirdPartyCopies(withAdsense).length > 0);
  assert.throws(
    () => transform(withGa, 'noticias/nuevo/index.html'),
    /noticias\/nuevo\/index\.html/
  );
  assert.throws(() => transform(withAdsense), /adsbygoogle/);
});

test('anti-copias: nombrar Google Analytics en el texto no cuenta como copia', () => {
  const html =
    '<html><head></head><body><p>Usamos Google Analytics (googletagmanager.com) y AdSense.</p></body></html>';
  assert.deepEqual(findThirdPartyCopies(html), []);
});

test('vite.config.js registra el plugin y las 42 entradas quedan con una inyección, 41 con AdSense', () => {
  assert.ok(
    config.plugins.some(plugin => plugin.name === 'third-parties'),
    'el plugin no está en vite.config.js'
  );
  const entries = Object.values(config.build.rollupOptions.input);
  assert.equal(entries.length, 42);

  const withAdsense = [];
  for (const entry of entries) {
    const html = readFileSync(`${ROOT}${entry}`, 'utf8');
    const out = transform(html, entry);
    assert.equal(count(out, THIRD_PARTIES_TAG), 1, entry);
    assert.equal(count(out, FIELD_METRICS_ENTRY), 1, entry);
    assert.equal(count(out, 'googletagmanager.com/gtag/js'), 0, entry);
    if (out.includes('adsbygoogle.js')) {
      assert.equal(count(out, 'adsbygoogle.js'), 1, entry);
      withAdsense.push(entry);
    }
  }
  assert.equal(withAdsense.length, 41);
  assert.ok(!withAdsense.includes('politica-de-privacidad/index.html'));
});
