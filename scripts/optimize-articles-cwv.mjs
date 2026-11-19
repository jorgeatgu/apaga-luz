#!/usr/bin/env node
// Bulk-rewrite de noticias/*/index.html para mejorar Core Web Vitals: styles.js y blog.js
// cargan con defer explícito. GA4 y AdSense no van en los HTML: los inyecta el plugin
// third-parties (scripts/vite-plugin-third-parties.mjs).
//
// Idempotente: si un archivo ya está migrado, lo deja igual.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS = join(ROOT, 'noticias');

// Scripts modules sin defer
const OLD_STYLES = `  <script type="module" src="/source/javascript/styles.js"></script>`;
const NEW_STYLES = `  <script type="module" defer src="/source/javascript/styles.js"></script>`;

const OLD_BLOG = `  <script type="module" src="/source/javascript/blog.js"></script>`;
const NEW_BLOG = `  <script type="module" defer src="/source/javascript/blog.js"></script>`;

const articles = (await readdir(NOTICIAS, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => join(NOTICIAS, d.name, 'index.html'));

let migrated = 0;
let alreadyOk = 0;

for (const file of articles) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue; // Carpeta sin index.html
  }

  const original = html;

  // 1) defer en styles.js
  if (html.includes(OLD_STYLES)) {
    html = html.replace(OLD_STYLES, NEW_STYLES);
  } else if (!html.includes('defer src="/source/javascript/styles.js"')) {
    // El artículo puede no usar styles.js, no es error
  }

  // 2) defer en blog.js
  if (html.includes(OLD_BLOG)) {
    html = html.replace(OLD_BLOG, NEW_BLOG);
  } else if (!html.includes('defer src="/source/javascript/blog.js"')) {
    // No todos lo usan, no es error
  }

  if (html === original) {
    alreadyOk++;
    continue;
  }

  await writeFile(file, html, 'utf8');
  migrated++;
  console.log(`✓ ${file.replace(ROOT + '/', '')}`);
}

console.log(`\nMigrados: ${migrated}`);
console.log(`Ya correctos: ${alreadyOk}`);
