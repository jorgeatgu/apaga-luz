#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const OLD_RUBIK = `    @font-face {
      font-family: 'Rubik-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 103%;
      ascent-override: 88%;
      descent-override: 24%;
      line-gap-override: 0%;
    }`;

const NEW_RUBIK = `    @font-face {
      font-family: 'Rubik-fallback';
      src: local('Arial');
      size-adjust: 101.82%;
      ascent-override: 91.14%;
      descent-override: 22.79%;
      line-gap-override: 0%;
    }`;

const OLD_FJALLA = `    @font-face {
      font-family: 'Fjalla-fallback';
      src: local('BlinkMacSystemFont'), local('-apple-system'), local('Segoe UI');
      size-adjust: 96%;
      ascent-override: 100%;
      descent-override: 22%;
      line-gap-override: 0%;
    }`;

const NEW_FJALLA = `    @font-face {
      font-family: 'Fjalla-fallback';
      src: local('Arial Narrow'), local('Arial');
      size-adjust: 92.18%;
      ascent-override: 112.93%;
      descent-override: 29.29%;
      line-gap-override: 0%;
    }`;

const allHtml = execSync('git ls-files "*.html"', { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(p => !p.startsWith('build/') && !p.startsWith('node_modules/'));

const targets = allHtml.filter(p => {
  const c = readFileSync(resolve(repoRoot, p), 'utf8');
  return c.includes("font-family: 'Rubik-fallback'") || c.includes("font-family: 'Fjalla-fallback'");
});

console.log(`Candidatos: ${targets.length}`);

let modified = 0;
let alreadyDone = 0;
const skipped = [];

for (const rel of targets) {
  const abs = resolve(repoRoot, rel);
  const original = readFileSync(abs, 'utf8');
  let updated = original;

  const hasOldRubik = updated.includes(OLD_RUBIK);
  const hasNewRubik = updated.includes(NEW_RUBIK);
  const hasOldFjalla = updated.includes(OLD_FJALLA);
  const hasNewFjalla = updated.includes(NEW_FJALLA);

  if (hasOldRubik) updated = updated.replaceAll(OLD_RUBIK, NEW_RUBIK);
  if (hasOldFjalla) updated = updated.replaceAll(OLD_FJALLA, NEW_FJALLA);

  if (updated !== original) {
    writeFileSync(abs, updated);
    console.log(`  modificado: ${rel}`);
    modified++;
  } else if (hasNewRubik && hasNewFjalla) {
    alreadyDone++;
  } else {
    const reasons = [];
    if (!hasOldRubik && !hasNewRubik) reasons.push('no Rubik-fallback');
    if (!hasOldFjalla && !hasNewFjalla) reasons.push('no Fjalla-fallback');
    if (hasOldRubik || hasOldFjalla) reasons.push('replace did not match (revisar indentación o EOL)');
    skipped.push(`${rel} — ${reasons.join('; ')}`);
  }
}

console.log(`\nResultado: ${modified} modificados, ${alreadyDone} ya estaban al día, ${skipped.length} saltados (de ${targets.length} candidatos)`);
if (skipped.length) {
  console.log('\nSaltados:');
  for (const s of skipped) console.log(`  - ${s}`);
}
