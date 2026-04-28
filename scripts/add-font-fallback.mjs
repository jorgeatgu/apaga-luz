#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Fjalla+One&family=Roboto+Condensed:wght@100..900&family=Rubik:wght@300..900&display=swap';

const OLD_LINK = `  <link href="${FONTS_HREF}" rel="stylesheet">`;

const NEW_LINK_AND_STYLE = `  <link rel="preload" as="style" href="${FONTS_HREF}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="${FONTS_HREF}" rel="stylesheet"></noscript>
  <style>
    @font-face {
      font-family: 'Rubik-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 103%;
      ascent-override: 88%;
      descent-override: 24%;
      line-gap-override: 0%;
    }
    @font-face {
      font-family: 'Fjalla-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 96%;
      ascent-override: 100%;
      descent-override: 22%;
      line-gap-override: 0%;
    }
    @font-face {
      font-family: 'RobotoCondensed-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 89%;
      ascent-override: 95%;
      descent-override: 24%;
      line-gap-override: 0%;
    }
  </style>`;

const STYLE_BLOCK_ONLY = `  <style>
    @font-face {
      font-family: 'Rubik-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 103%;
      ascent-override: 88%;
      descent-override: 24%;
      line-gap-override: 0%;
    }
    @font-face {
      font-family: 'Fjalla-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 96%;
      ascent-override: 100%;
      descent-override: 22%;
      line-gap-override: 0%;
    }
    @font-face {
      font-family: 'RobotoCondensed-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 89%;
      ascent-override: 95%;
      descent-override: 24%;
      line-gap-override: 0%;
    }
  </style>`;

const ROOT_VARS_OLD = `      --numbers: 'Fjalla One', sans-serif;
      --roboto: 'Roboto Condensed', sans-serif;
      --text: 'Rubik', sans-serif;`;

const ROOT_VARS_NEW = `      --numbers: 'Fjalla One', 'Fjalla-fallback', sans-serif;
      --roboto: 'Roboto Condensed', 'RobotoCondensed-fallback', sans-serif;
      --text: 'Rubik', 'Rubik-fallback', sans-serif;`;

const allHtml = execSync('git ls-files "*.html"', { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(p => !p.startsWith('build/') && !p.startsWith('node_modules/') && p !== 'index.html');

const targets = allHtml.filter(p => {
  const c = readFileSync(resolve(repoRoot, p), 'utf8');
  return c.includes('googleapis.com/css2?family=Fjalla') && !c.includes('Rubik-fallback');
});

console.log(`Candidatos: ${targets.length}`);

let modified = 0;
const skipped = [];

for (const rel of targets) {
  const abs = resolve(repoRoot, rel);
  const original = readFileSync(abs, 'utf8');
  let updated = original;

  if (updated.includes(OLD_LINK)) {
    updated = updated.replace(OLD_LINK, NEW_LINK_AND_STYLE);
  } else {
    const preloadIdx = updated.indexOf('rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fjalla');
    if (preloadIdx === -1) {
      skipped.push(`${rel} — no se encontró ni el <link> viejo ni el preload`);
      continue;
    }
    const noscriptClose = '</noscript>';
    const noscriptIdx = updated.indexOf(noscriptClose, preloadIdx);
    if (noscriptIdx === -1) {
      skipped.push(`${rel} — preload presente pero sin </noscript> a continuación`);
      continue;
    }
    const insertPos = noscriptIdx + noscriptClose.length;
    updated = updated.slice(0, insertPos) + '\n' + STYLE_BLOCK_ONLY + updated.slice(insertPos);
  }

  updated = updated.replaceAll(ROOT_VARS_OLD, ROOT_VARS_NEW);

  if (updated !== original) {
    writeFileSync(abs, updated);
    console.log(`  modificado: ${rel}`);
    modified++;
  } else {
    skipped.push(`${rel} — sin cambios tras procesar`);
  }
}

console.log(`\nResultado: ${modified}/${targets.length} archivos modificados`);
if (skipped.length) {
  console.log('\nSaltados:');
  for (const s of skipped) console.log(`  - ${s}`);
}
