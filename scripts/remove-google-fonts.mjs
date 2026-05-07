#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const FALLBACK_FAMILIES = ['Rubik-fallback', 'Fjalla-fallback', 'RobotoCondensed-fallback'];

const transforms = [
  {
    label: 'preconnect googleapis',
    pattern: /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"[^>]*>\r?\n/gm
  },
  {
    label: 'preconnect gstatic',
    pattern: /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>\r?\n/gm
  },
  {
    label: 'comentario Google Fonts async',
    pattern: /^[ \t]*<!--\s*Google Fonts async load[^>]*-->\r?\n/gm
  },
  {
    label: 'preload Google Fonts',
    pattern: /^[ \t]*<link rel="preload"[^>]*fonts\.googleapis\.com[^>]*>\r?\n/gm
  },
  {
    label: 'noscript Google Fonts',
    pattern: /^[ \t]*<noscript><link[^>]*fonts\.googleapis\.com[^>]*><\/noscript>\r?\n/gm
  },
  {
    label: 'comentario font fallbacks',
    pattern: /^[ \t]*\/\*\s*Font fallbacks con size-adjust[^*]*\*\/\r?\n/gm
  },
  ...FALLBACK_FAMILIES.map(family => ({
    label: `@font-face ${family}`,
    pattern: new RegExp(
      String.raw`^[ \t]*@font-face\s*\{\s*font-family:\s*'${family}';[\s\S]*?\}\r?\n`,
      'gm'
    )
  })),
  {
    label: '--numbers var',
    pattern: /(--numbers:\s*)'Fjalla One',\s*'Fjalla-fallback',\s*sans-serif/g,
    replacement: '$1var(--fontSystem)'
  },
  {
    label: '--roboto var',
    pattern: /(--roboto:\s*)'Roboto Condensed',\s*'RobotoCondensed-fallback',\s*sans-serif/g,
    replacement: '$1var(--fontSystem)'
  },
  {
    label: '--text var',
    pattern: /(--text:\s*)'Rubik',\s*'Rubik-fallback',\s*sans-serif/g,
    replacement: '$1var(--fontSystem)'
  }
];

const allHtml = execSync('git ls-files "*.html"', { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(p => !p.startsWith('build/') && !p.startsWith('node_modules/'));

console.log(`Candidatos: ${allHtml.length}`);

let modified = 0;
let unchanged = 0;
const counts = new Map(transforms.map(t => [t.label, 0]));

for (const rel of allHtml) {
  const abs = resolve(repoRoot, rel);
  const original = readFileSync(abs, 'utf8');
  let updated = original;

  for (const t of transforms) {
    const before = updated;
    updated = t.replacement
      ? updated.replace(t.pattern, t.replacement)
      : updated.replace(t.pattern, '');
    if (before !== updated) counts.set(t.label, counts.get(t.label) + 1);
  }

  if (updated !== original) {
    writeFileSync(abs, updated);
    modified++;
  } else {
    unchanged++;
  }
}

console.log(`\nResultado: ${modified} modificados, ${unchanged} sin cambios`);
console.log('\nAplicaciones por transformación:');
for (const [label, count] of counts) {
  console.log(`  ${count.toString().padStart(4)}  ${label}`);
}
