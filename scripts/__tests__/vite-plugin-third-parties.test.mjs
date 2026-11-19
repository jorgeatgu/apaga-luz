import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  FIELD_METRICS_ENTRY,
  thirdPartiesPlugin
} from '../vite-plugin-third-parties.mjs';
import config from '../../vite.config.js';

const ENTRY_TAG = `<script type="module" src="${FIELD_METRICS_ENTRY}"></script>`;
const count = (html, needle) => html.split(needle).length - 1;

function transform(html) {
  const plugin = thirdPartiesPlugin();
  return plugin.transformIndexHtml.handler(html);
}

test('inyecta la entrada de la medición de campo una vez, antes de </head>', () => {
  const html =
    '<!doctype html><html><head><title>x</title></head><body><p>hola</p></body></html>';
  const out = transform(html);
  assert.equal(
    out,
    `<!doctype html><html><head><title>x</title>${ENTRY_TAG}\n</head><body><p>hola</p></body></html>`
  );
});

test('si se ejecuta dos veces no la duplica', () => {
  const html = '<html><head></head><body></body></html>';
  assert.equal(count(transform(transform(html)), FIELD_METRICS_ENTRY), 1);
});

test('vite.config.js registra el plugin y cada una de las 42 entradas queda con una inyección', () => {
  assert.ok(
    config.plugins.some(plugin => plugin.name === 'third-parties'),
    'el plugin no está en vite.config.js'
  );
  const entries = Object.values(config.build.rollupOptions.input);
  assert.equal(entries.length, 42);
  for (const entry of entries) {
    const html = readFileSync(
      new URL(`../../${entry}`, import.meta.url),
      'utf8'
    );
    assert.equal(count(transform(html), FIELD_METRICS_ENTRY), 1, entry);
  }
});
