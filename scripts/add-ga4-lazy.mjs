#!/usr/bin/env node
// Inserta el snippet de GA4 con carga diferida (primera interacción o 5 s)
// antes de </head> en cada página registrada en vite.config.js.
// Idempotente: si la página ya contiene el ID de medición, no la toca.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import viteConfig from '../vite.config.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const GA_ID = 'G-E9V8ZPM3P0';

const pages = Object.values(viteConfig.build.rollupOptions.input).map(p =>
  join(ROOT, p)
);

const snippet = `  <!-- Google Analytics 4: carga diferida (primera interacción o 5 s) -->
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  (() => {
    let gtmLoaded = false;
    const loadGTM = () => {
      if (gtmLoaded) return;
      gtmLoaded = true;
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => { gtag('js', new Date()); gtag('config', '${GA_ID}'); };
    };
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, loadGTM, { once: true, passive: true });
    });
    setTimeout(loadGTM, 5000);
  })();
  </script>
`;

let added = 0;
let skipped = 0;
const errors = [];

for (const file of pages) {
  const rel = file.replace(ROOT, '');
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    errors.push(`${rel}: no existe`);
    continue;
  }

  if (html.includes(GA_ID)) {
    skipped++;
    continue;
  }

  const heads = html.split('</head>').length - 1;
  if (heads !== 1) {
    errors.push(`${rel}: ${heads} </head> (se esperaba 1)`);
    continue;
  }

  html = html.replace('</head>', `${snippet}</head>`);
  await writeFile(file, html, 'utf8');
  added++;
  console.log(`✓ ${rel}`);
}

console.log(`\nPáginas: ${pages.length}`);
console.log(`Añadidos: ${added}`);
console.log(`Ya tenían: ${skipped}`);
if (errors.length) {
  console.log(`\nErrores (${errors.length}):`);
  errors.forEach(e => console.log(`  ✗ ${e}`));
  process.exit(1);
}
