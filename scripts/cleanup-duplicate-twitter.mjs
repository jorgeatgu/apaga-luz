#!/usr/bin/env node
// Limpia twitter:card duplicado en artículos que ya tenían tags previos.
// Elimina la SEGUNDA aparición de twitter:card/title/description (el bloque viejo),
// dejando el primer bloque que sí incluye twitter:image.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS = join(ROOT, 'noticias');

const articles = (await readdir(NOTICIAS, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => join(NOTICIAS, d.name, 'index.html'));

let cleaned = 0;
let skipped = 0;

for (const file of articles) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue;
  }

  const cardMatches = [...html.matchAll(/<meta\s+name="twitter:card"\s+content="[^"]+"\s*\/?>/g)];
  if (cardMatches.length < 2) {
    skipped++;
    continue;
  }

  // Localiza el inicio del segundo bloque (línea de twitter:card #2)
  const secondCardIdx = cardMatches[1].index;

  // Selecciona desde el segundo twitter:card hasta el último twitter:* contiguo
  const re = /(\s*<meta\s+name="twitter:(?:card|title|description|image|site|creator)"\s+content="[^"]+"\s*\/?>)+/g;
  let m;
  let blockStart = secondCardIdx;
  let blockEnd = secondCardIdx;
  re.lastIndex = secondCardIdx;
  while ((m = re.exec(html))) {
    if (m.index !== blockEnd) break;
    blockEnd = m.index + m[0].length;
  }

  if (blockEnd === blockStart) {
    skipped++;
    continue;
  }

  html = html.slice(0, blockStart) + html.slice(blockEnd);

  await writeFile(file, html, 'utf8');
  cleaned++;
  console.log(`✓ ${file.replace(ROOT + '/', '')}`);
}

console.log(`\nLimpiados: ${cleaned}`);
console.log(`Sin duplicados: ${skipped}`);
