#!/usr/bin/env node
// Bulk-rewrite de noticias/*/index.html para mejorar Core Web Vitals:
//   1) GA pasa de <script async> directo a lazy-load por user interaction (patrón de la home)
//   2) styles.js y blog.js cargan con defer explícito
//
// Idempotente: si un archivo ya está migrado, lo deja igual. Si encuentra un patrón
// inesperado, aborta el archivo y reporta para revisión manual.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS = join(ROOT, 'noticias');

const GA_ID = 'G-E9V8ZPM3P0';

// Patrones actuales (asíncrono directo) — hay 2 variantes en el repo, con y sin línea en blanco
const OLD_GA_VARIANTS = [
  `  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
  </script>`,
  `  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
  window.dataLayer = window.dataLayer || [];

  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
  </script>`,
];

// Patrón nuevo (lazy load por interacción, copiado de index.html:607-635)
const NEW_GA = `  <!-- Google Tag Manager - Lazy loaded for INP optimization -->
  <script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  let gtmLoaded = false;
  const loadGTM = () => {
    if (gtmLoaded) return;
    gtmLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    };
  };

  ['click', 'scroll', 'keydown', 'touchstart'].forEach(event => {
    document.addEventListener(event, loadGTM, { once: true, passive: true });
  });

  setTimeout(loadGTM, 5000);
  </script>`;

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
const errors = [];

for (const file of articles) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue; // Carpeta sin index.html
  }

  const original = html;

  // 1) GA lazy
  let gaMatched = false;
  for (const variant of OLD_GA_VARIANTS) {
    if (html.includes(variant)) {
      html = html.replace(variant, NEW_GA);
      gaMatched = true;
      break;
    }
  }
  if (!gaMatched && !html.includes('loadGTM')) {
    errors.push(`${file}: no matchea ninguna variante de OLD_GA ni patrón lazy nuevo`);
    continue;
  }

  // 2) defer en styles.js
  if (html.includes(OLD_STYLES)) {
    html = html.replace(OLD_STYLES, NEW_STYLES);
  } else if (!html.includes('defer src="/source/javascript/styles.js"')) {
    // El artículo puede no usar styles.js, no es error
  }

  // 3) defer en blog.js
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
if (errors.length) {
  console.log(`\nErrores (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}
