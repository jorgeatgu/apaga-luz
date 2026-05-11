#!/usr/bin/env node
// Añade <link rel="apple-touch-icon"> al <head> de cada noticias/*/index.html
// si no lo tiene ya. Lo inserta justo después del link de favicon-16x16.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS = join(ROOT, 'noticias');

const APPLE_LINK = '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">';

const articles = (await readdir(NOTICIAS, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => join(NOTICIAS, d.name, 'index.html'));

let added = 0;
let skipped = 0;
const errors = [];

for (const file of articles) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue;
  }

  if (html.includes('rel="apple-touch-icon"')) {
    skipped++;
    continue;
  }

  // Inserta tras el primer link de favicon-16x16
  const re = /(<link rel="icon" type="image\/png" sizes="16x16" href="\/favicon-16x16\.png">)/;
  if (!re.test(html)) {
    errors.push(`${file}: no matchea favicon-16x16`);
    continue;
  }

  // Calcular indentación de la línea matched
  const match = html.match(/(^[ \t]*)<link rel="icon" type="image\/png" sizes="16x16" href="\/favicon-16x16\.png">/m);
  const indent = match ? match[1] : '  ';

  html = html.replace(re, `$1\n${indent}${APPLE_LINK}`);

  await writeFile(file, html, 'utf8');
  added++;
  console.log(`✓ ${file.replace(ROOT + '/', '')}`);
}

console.log(`\nAñadidos: ${added}`);
console.log(`Ya tenían: ${skipped}`);
if (errors.length) {
  console.log(`\nErrores (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}
