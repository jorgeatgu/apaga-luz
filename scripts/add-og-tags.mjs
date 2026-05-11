#!/usr/bin/env node
// Añade Open Graph + Twitter Card metadata al <head> de cada noticias/*/index.html.
// Extrae title, description y canonical existentes y los reutiliza.
// Idempotente: si ya hay og:image no toca; si faltan tags, los añade.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS = join(ROOT, 'noticias');
const OG_IMAGE = 'https://www.apaga-luz.com/og-image.png';
const SITE_NAME = 'Apaga Luz';

const articles = (await readdir(NOTICIAS, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => join(NOTICIAS, d.name, 'index.html'));

let added = 0;
let imageAdded = 0;
let skipped = 0;
const errors = [];

const escapeAttr = (s) => s.replace(/"/g, '&quot;').replace(/\s+/g, ' ').trim();

for (const file of articles) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue;
  }

  // Si ya tiene og:image, no toca
  if (html.includes('property="og:image"')) {
    skipped++;
    continue;
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/);
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/);

  if (!titleMatch || !descMatch || !canonicalMatch) {
    errors.push(`${file}: falta title, description o canonical`);
    continue;
  }

  const title = escapeAttr(titleMatch[1]);
  const desc = escapeAttr(descMatch[1]);
  const url = canonicalMatch[1];

  // Si ya tiene algunos og: pero no og:image, solo añade og:image + twitter
  if (html.includes('property="og:title"')) {
    // Insertar og:image antes del primer </head> o tras el último og:*
    const lastOgRe = /(<meta property="og:[^"]+" content="[^"]*">[^<]*)+/;
    const ogBlock = html.match(lastOgRe);
    if (ogBlock) {
      const insert = `\n  <meta property="og:image" content="${OG_IMAGE}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${title}">\n  <meta name="twitter:description" content="${desc}">\n  <meta name="twitter:image" content="${OG_IMAGE}">`;
      html = html.replace(ogBlock[0], ogBlock[0] + insert);
      imageAdded++;
      await writeFile(file, html, 'utf8');
      console.log(`✓ (img only) ${file.replace(ROOT + '/', '')}`);
      continue;
    }
  }

  // Caso general: añadir bloque completo después del meta description
  const block = `

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME}">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${OG_IMAGE}">`;

  const descRe = /(<meta\s+name="description"\s+content="[^"]+"\s*\/?>)/;
  if (!descRe.test(html)) {
    errors.push(`${file}: descRe no matchea`);
    continue;
  }
  html = html.replace(descRe, `$1${block}`);

  await writeFile(file, html, 'utf8');
  added++;
  console.log(`✓ ${file.replace(ROOT + '/', '')}`);
}

console.log(`\nAñadidos completo: ${added}`);
console.log(`Solo og:image: ${imageAdded}`);
console.log(`Ya tenían: ${skipped}`);
if (errors.length) {
  console.log(`\nErrores (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}
