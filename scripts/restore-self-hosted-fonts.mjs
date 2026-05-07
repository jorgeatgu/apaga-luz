#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const MARKER = '/* self-hosted fonts */';

const FONT_BLOCK = `  <link rel="preload" as="font" type="font/woff2" href="/fonts/fjalla-one-latin-400.woff2" crossorigin>
  <style>
    ${MARKER}
    @font-face {
      font-family: 'Fjalla One';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/fjalla-one-latin-400.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Roboto Condensed';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/roboto-condensed-latin-700.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Fjalla-fallback';
      src: local('Arial Narrow'), local('Arial');
      size-adjust: 92.18%;
      ascent-override: 112.93%;
      descent-override: 29.29%;
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
  </style>
`;

const VAR_REPLACEMENTS = [
  {
    pattern: /(--numbers:\s*)var\(--fontSystem\);/g,
    replacement: "$1'Fjalla One', 'Fjalla-fallback', sans-serif;"
  },
  {
    pattern: /(--roboto:\s*)var\(--fontSystem\);/g,
    replacement: "$1'Roboto Condensed', 'RobotoCondensed-fallback', sans-serif;"
  }
];

const allHtml = execSync('git ls-files "*.html"', { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(p => !p.startsWith('build/') && !p.startsWith('node_modules/'));

let injected = 0;
let alreadyDone = 0;
let varsUpdated = 0;
const skipped = [];

for (const rel of allHtml) {
  const abs = resolve(repoRoot, rel);
  const original = readFileSync(abs, 'utf8');
  let updated = original;

  for (const v of VAR_REPLACEMENTS) {
    const before = updated;
    updated = updated.replace(v.pattern, v.replacement);
    if (before !== updated) varsUpdated++;
  }

  if (updated.includes(MARKER)) {
    alreadyDone++;
  } else if (updated.includes('</head>')) {
    updated = updated.replace('</head>', `${FONT_BLOCK}</head>`);
    injected++;
  } else {
    skipped.push(`${rel} — sin </head>`);
  }

  if (updated !== original) writeFileSync(abs, updated);
}

console.log(`Bloque insertado: ${injected}`);
console.log(`Ya tenía bloque: ${alreadyDone}`);
console.log(`Vars restauradas: ${varsUpdated}`);
if (skipped.length) {
  console.log(`Saltados: ${skipped.length}`);
  for (const s of skipped) console.log(`  - ${s}`);
}
